import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeMode } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { CryptoService } from '../../common/crypto/crypto.service';
import { PrismaService } from '../../prisma/prisma.service';

export interface ResolvedSmtpConfig {
  source: 'database' | 'environment';
  host: string;
  port: number;
  secure: boolean;
  username?: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
}

export interface ResolvedStripeProfile {
  id?: string;
  source: 'database' | 'environment';
  label: string;
  mode: StripeMode;
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  currency: string;
  isActive: boolean;
}

@Injectable()
export class DynamicSettingsService {
  private readonly logger = new Logger(DynamicSettingsService.name);

  // In-memory cache with short TTL
  private cachedSmtp: { data: ResolvedSmtpConfig; expiresAt: number } | null = null;
  private cachedActiveStripe: { data: ResolvedStripeProfile; expiresAt: number } | null = null;
  private cachedStripeClient: { client: Stripe; secretKey: string } | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 60 seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Invalidate caches upon settings modification
   */
  invalidateCache(settingType?: 'SMTP' | 'STRIPE' | string) {
    if (!settingType || settingType === 'SMTP') {
      this.cachedSmtp = null;
    }
    if (!settingType || settingType === 'STRIPE') {
      this.cachedActiveStripe = null;
      this.cachedStripeClient = null;
    }
    this.logger.log(`Dynamic settings cache invalidated (${settingType || 'ALL'})`);
  }

  // ───────────────────────────────────────────────
  // SMTP CONFIGURATION RESOLUTION
  // ───────────────────────────────────────────────

  async getSmtpConfig(): Promise<ResolvedSmtpConfig> {
    const now = Date.now();
    if (this.cachedSmtp && this.cachedSmtp.expiresAt > now) {
      return this.cachedSmtp.data;
    }

    try {
      const dbSettings = await this.prisma.smtpSettings.findFirst({
        orderBy: { updatedAt: 'desc' },
      });

      if (dbSettings) {
        let decryptedPassword = '';
        if (
          dbSettings.encryptedPassword &&
          dbSettings.passwordIv &&
          dbSettings.passwordTag
        ) {
          try {
            decryptedPassword = this.cryptoService.decrypt(
              dbSettings.encryptedPassword,
              dbSettings.passwordIv,
              dbSettings.passwordTag,
            );
          } catch (decErr) {
            this.logger.error('Failed to decrypt database SMTP password:', decErr);
          }
        }

        const resolved: ResolvedSmtpConfig = {
          source: 'database',
          host: dbSettings.host,
          port: dbSettings.port,
          secure: dbSettings.secure,
          username: dbSettings.username || undefined,
          password: decryptedPassword || undefined,
          fromName: dbSettings.fromName,
          fromEmail: dbSettings.fromEmail,
          isEnabled: dbSettings.isEnabled,
        };

        this.cachedSmtp = { data: resolved, expiresAt: now + this.CACHE_TTL_MS };
        return resolved;
      }
    } catch (err) {
      this.logger.warn('Error reading SmtpSettings from DB, falling back to environment:', err);
    }

    // Fallback to environment variables
    const fallbackFrom = this.configService.get<string>('MAIL_FROM') || 'PGX Store <support@example.com>';
    let parsedFromName = 'PGX Store';
    let parsedFromEmail = 'support@example.com';

    const match = fallbackFrom.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
      parsedFromName = match[1].trim() || 'PGX Store';
      parsedFromEmail = match[2].trim();
    } else if (fallbackFrom.includes('@')) {
      parsedFromEmail = fallbackFrom.trim();
    }

    const envConfig: ResolvedSmtpConfig = {
      source: 'environment',
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<number>('SMTP_PORT')) || 587,
      secure: Number(this.configService.get<number>('SMTP_PORT')) === 465,
      username: this.configService.get<string>('SMTP_USER') || undefined,
      password: this.configService.get<string>('SMTP_PASS') || undefined,
      fromName: parsedFromName,
      fromEmail: parsedFromEmail,
      isEnabled: true,
    };

    this.cachedSmtp = { data: envConfig, expiresAt: now + this.CACHE_TTL_MS };
    return envConfig;
  }

  /**
   * Builds a live Nodemailer transporter using dynamic configuration
   */
  async createMailTransporter(customConfig?: Partial<ResolvedSmtpConfig>): Promise<{
    transporter: nodemailer.Transporter;
    from: string;
    isEnabled: boolean;
  }> {
    const config = customConfig
      ? { ...(await this.getSmtpConfig()), ...customConfig }
      : await this.getSmtpConfig();

    const auth =
      config.username && config.password
        ? { user: config.username, pass: config.password }
        : undefined;

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth,
    });

    const from = config.fromName
      ? `"${config.fromName}" <${config.fromEmail}>`
      : config.fromEmail;

    return {
      transporter,
      from,
      isEnabled: config.isEnabled,
    };
  }

  // ───────────────────────────────────────────────
  // STRIPE MULTI-PROFILE RESOLUTION
  // ───────────────────────────────────────────────

  async getActiveStripeProfile(): Promise<ResolvedStripeProfile> {
    const now = Date.now();
    if (this.cachedActiveStripe && this.cachedActiveStripe.expiresAt > now) {
      return this.cachedActiveStripe.data;
    }

    try {
      const activeDbProfile = await this.prisma.stripeProfile.findFirst({
        where: { isActive: true },
      });

      if (activeDbProfile) {
        let decryptedSecret = '';
        let decryptedWebhook = '';

        try {
          decryptedSecret = this.cryptoService.decrypt(
            activeDbProfile.encryptedSecretKey,
            activeDbProfile.secretKeyIv,
            activeDbProfile.secretKeyTag,
          );
        } catch (err) {
          this.logger.error('Failed to decrypt active Stripe secret key:', err);
        }

        try {
          decryptedWebhook = this.cryptoService.decrypt(
            activeDbProfile.encryptedWebhookSecret,
            activeDbProfile.webhookSecretIv,
            activeDbProfile.webhookSecretTag,
          );
        } catch (err) {
          this.logger.error('Failed to decrypt active Stripe webhook secret:', err);
        }

        const resolved: ResolvedStripeProfile = {
          id: activeDbProfile.id,
          source: 'database',
          label: activeDbProfile.label,
          mode: activeDbProfile.mode,
          publishableKey: activeDbProfile.publishableKey,
          secretKey: decryptedSecret,
          webhookSecret: decryptedWebhook,
          currency: (activeDbProfile.currency || 'eur').toLowerCase(),
          isActive: true,
        };

        this.cachedActiveStripe = {
          data: resolved,
          expiresAt: now + this.CACHE_TTL_MS,
        };
        return resolved;
      }
    } catch (err) {
      this.logger.warn('Error reading active StripeProfile from DB, falling back to environment:', err);
    }

    // Fallback to environment variables
    const envSecret = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    const envWebhook = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    const envCurrency = (this.configService.get<string>('STRIPE_CURRENCY') || 'eur').toLowerCase();
    const envMode: StripeMode = /^(sk|rk)_live_/.test(envSecret) ? StripeMode.LIVE : StripeMode.TEST;

    const envProfile: ResolvedStripeProfile = {
      source: 'environment',
      label: 'Default Environment Profile',
      mode: envMode,
      publishableKey: '', // populated if needed
      secretKey: envSecret,
      webhookSecret: envWebhook,
      currency: envCurrency,
      isActive: true,
    };

    this.cachedActiveStripe = {
      data: envProfile,
      expiresAt: now + this.CACHE_TTL_MS,
    };
    return envProfile;
  }

  /**
   * Retrieves an initialized Stripe SDK client for the currently active profile
   */
  async getStripeClient(): Promise<{ client: Stripe; profile: ResolvedStripeProfile }> {
    const profile = await this.getActiveStripeProfile();
    const secretKey = profile.secretKey;

    if (!secretKey) {
      this.logger.warn('Stripe secret key is empty in active configuration');
    }

    if (
      this.cachedStripeClient &&
      this.cachedStripeClient.secretKey === secretKey
    ) {
      return { client: this.cachedStripeClient.client, profile };
    }

    const client = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });

    this.cachedStripeClient = { client, secretKey };
    return { client, profile };
  }

  /**
   * Resolves a Stripe profile by ID (with decrypted secrets)
   */
  async getStripeProfileById(id: string): Promise<ResolvedStripeProfile | null> {
    const p = await this.prisma.stripeProfile.findUnique({ where: { id } });
    if (!p) return null;

    let secretKey = '';
    let webhookSecret = '';

    try {
      secretKey = this.cryptoService.decrypt(
        p.encryptedSecretKey,
        p.secretKeyIv,
        p.secretKeyTag,
      );
    } catch {}

    try {
      webhookSecret = this.cryptoService.decrypt(
        p.encryptedWebhookSecret,
        p.webhookSecretIv,
        p.webhookSecretTag,
      );
    } catch {}

    return {
      id: p.id,
      source: 'database',
      label: p.label,
      mode: p.mode,
      publishableKey: p.publishableKey,
      secretKey,
      webhookSecret,
      currency: (p.currency || 'eur').toLowerCase(),
      isActive: p.isActive,
    };
  }

  /**
   * Resolves all available Stripe webhook secrets (active profile first, then others, plus env fallback)
   */
  async getAllWebhookSecrets(): Promise<Array<{ secret: string; profileId?: string; label: string }>> {
    const results: Array<{ secret: string; profileId?: string; label: string }> = [];

    try {
      const profiles = await this.prisma.stripeProfile.findMany({
        orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }],
      });

      for (const p of profiles) {
        try {
          const secret = this.cryptoService.decrypt(
            p.encryptedWebhookSecret,
            p.webhookSecretIv,
            p.webhookSecretTag,
          );
          if (secret) {
            results.push({
              secret,
              profileId: p.id,
              label: p.label,
            });
          }
        } catch {}
      }
    } catch (err) {
      this.logger.warn('Failed to load webhook secrets from DB:', err);
    }

    // Always include env fallback secret if present and not already included
    const envSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (envSecret && !results.some((r) => r.secret === envSecret)) {
      results.push({
        secret: envSecret,
        label: 'Environment Fallback',
      });
    }

    return results;
  }

  // ───────────────────────────────────────────────
  // AUDIT LOGGING HELPER
  // ───────────────────────────────────────────────

  async recordAuditLog(params: {
    actorId?: string;
    actorEmail?: string;
    action: string;
    entityType: 'SMTP' | 'STRIPE';
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.settingsAuditLog.create({
        data: {
          actorId: params.actorId || null,
          actorEmail: params.actorEmail || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          details: params.details || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      this.logger.warn('Failed to persist settings audit log:', err);
    }
  }
}
