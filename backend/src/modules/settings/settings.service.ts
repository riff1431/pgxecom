import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeMode } from '@prisma/client';

import { CryptoService } from '../../common/crypto/crypto.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { TestSmtpDto, UpdateSmtpSettingsDto } from './dto/smtp-settings.dto';
import {
  CreateStripeProfileDto,
  UpdateStripeProfileDto,
  VerifyStripeProfileDto,
} from './dto/stripe-profile.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { DynamicSettingsService } from './dynamic-settings.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly dynamicSettingsService: DynamicSettingsService,
    private readonly cryptoService: CryptoService,
  ) {}

  async findPublic() {
    return this.prisma.storeSetting.findMany({
      where: {
        OR: [
          { group: 'general' },
          { group: 'contact' },
          { group: 'social' },
          { group: 'hero' },
        ],
      },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async findAll(query?: { group?: string; search?: string }) {
    const where: {
      group?: string;
      OR?: Array<
        | { key: { contains: string; mode: 'insensitive' } }
        | { value: { contains: string; mode: 'insensitive' } }
      >;
    } = {};

    if (query?.group) {
      where.group = query.group;
    }

    if (query?.search) {
      where.OR = [
        { key: { contains: query.search, mode: 'insensitive' } },
        { value: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.storeSetting.findMany({
      where,
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  async findOneByKey(key: string) {
    const setting = await this.prisma.storeSetting.findUnique({
      where: { key },
    });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }

    return setting;
  }

  async create(data: CreateSettingDto) {
    return this.prisma.storeSetting.create({
      data: {
        key: data.key.trim(),
        value: data.value,
        group: data.group?.trim() || 'general',
      },
    });
  }

  async updateByKey(key: string, data: UpdateSettingDto) {
    await this.findOneByKey(key);

    return this.prisma.storeSetting.update({
      where: { key },
      data: {
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.group !== undefined
          ? { group: data.group.trim() || 'general' }
          : {}),
      },
    });
  }

  async deleteByKey(key: string) {
    await this.findOneByKey(key);
    await this.prisma.storeSetting.delete({ where: { key } });

    return { message: 'Setting deleted successfully' };
  }

  async bulkUpsert(data: BulkUpsertSettingsDto) {
    const operations = data.items.map((item) =>
      this.prisma.storeSetting.upsert({
        where: { key: item.key.trim() },
        update: {
          value: item.value,
          group: item.group?.trim() || 'general',
        },
        create: {
          key: item.key.trim(),
          value: item.value,
          group: item.group?.trim() || 'general',
        },
      }),
    );

    return this.prisma.$transaction(operations);
  }

  // ───────────────────────────────────────────────
  // SMTP SETTINGS MANAGEMENT
  // ───────────────────────────────────────────────

  async getSmtpSettings() {
    const dbSettings = await this.prisma.smtpSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (dbSettings) {
      return {
        id: dbSettings.id,
        host: dbSettings.host,
        port: dbSettings.port,
        secure: dbSettings.secure,
        username: dbSettings.username || '',
        password: dbSettings.encryptedPassword ? this.cryptoService.maskSecret('password_present') : '',
        hasPassword: Boolean(dbSettings.encryptedPassword),
        fromName: dbSettings.fromName,
        fromEmail: dbSettings.fromEmail,
        isEnabled: dbSettings.isEnabled,
        updatedAt: dbSettings.updatedAt,
        source: 'database',
      };
    }

    // Fallback info from .env
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

    return {
      id: null,
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.configService.get<number>('SMTP_PORT')) || 587,
      secure: Number(this.configService.get<number>('SMTP_PORT')) === 465,
      username: this.configService.get<string>('SMTP_USER') || '',
      password: this.configService.get<string>('SMTP_PASS') ? this.cryptoService.maskSecret(this.configService.get<string>('SMTP_PASS')!) : '',
      hasPassword: Boolean(this.configService.get<string>('SMTP_PASS')),
      fromName: parsedFromName,
      fromEmail: parsedFromEmail,
      isEnabled: true,
      updatedAt: null,
      source: 'environment',
    };
  }

  async updateSmtpSettings(data: UpdateSmtpSettingsDto, adminUser?: { id: string; email: string }) {
    const existing = await this.prisma.smtpSettings.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let encryptedPassword = existing?.encryptedPassword || null;
    let passwordIv = existing?.passwordIv || null;
    let passwordTag = existing?.passwordTag || null;

    // If new password provided and not masked placeholder
    if (data.password && !data.password.includes('••••')) {
      const encrypted = this.cryptoService.encrypt(data.password);
      encryptedPassword = encrypted.encryptedText;
      passwordIv = encrypted.iv;
      passwordTag = encrypted.tag;
    }

    let saved;
    if (existing) {
      saved = await this.prisma.smtpSettings.update({
        where: { id: existing.id },
        data: {
          host: data.host.trim(),
          port: data.port,
          secure: data.secure,
          username: data.username?.trim() || null,
          encryptedPassword,
          passwordIv,
          passwordTag,
          fromName: data.fromName.trim(),
          fromEmail: data.fromEmail.trim(),
          isEnabled: data.isEnabled,
        },
      });
    } else {
      saved = await this.prisma.smtpSettings.create({
        data: {
          host: data.host.trim(),
          port: data.port,
          secure: data.secure,
          username: data.username?.trim() || null,
          encryptedPassword,
          passwordIv,
          passwordTag,
          fromName: data.fromName.trim(),
          fromEmail: data.fromEmail.trim(),
          isEnabled: data.isEnabled,
        },
      });
    }

    this.dynamicSettingsService.invalidateCache('SMTP');

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'UPDATE',
      entityType: 'SMTP',
      entityId: saved.id,
      details: {
        host: saved.host,
        port: saved.port,
        secure: saved.secure,
        fromEmail: saved.fromEmail,
        isEnabled: saved.isEnabled,
      },
    });

    return this.getSmtpSettings();
  }

  async testSmtpSettings(dto: TestSmtpDto, adminUser?: { id: string; email: string }) {
    const { transporter, from, isEnabled } = await this.dynamicSettingsService.createMailTransporter();

    if (!isEnabled) {
      throw new BadRequestException('SMTP is currently disabled in settings.');
    }

    try {
      await transporter.verify();
    } catch (verifyErr: any) {
      throw new BadRequestException(`SMTP Connection failed: ${verifyErr.message}`);
    }

    try {
      await transporter.sendMail({
        from,
        to: dto.recipientEmail,
        subject: 'PGX Store - SMTP Test Email',
        html: `
          <div style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px;">
            <h2 style="color: #38bdf8; margin-top: 0;">SMTP Configuration Successful!</h2>
            <p>Your SMTP mail server has been verified and can deliver transactional emails.</p>
            <hr style="border: 1px solid #1e293b; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8;">Sent via PGX Dynamic Settings Admin Console at ${new Date().toISOString()}</p>
          </div>
        `,
      });

      await this.dynamicSettingsService.recordAuditLog({
        actorId: adminUser?.id,
        actorEmail: adminUser?.email,
        action: 'TEST',
        entityType: 'SMTP',
        details: { recipientEmail: dto.recipientEmail, status: 'SUCCESS' },
      });

      return {
        success: true,
        message: `Test email successfully sent to ${dto.recipientEmail}`,
      };
    } catch (sendErr: any) {
      throw new BadRequestException(`Failed to send test email: ${sendErr.message}`);
    }
  }

  async importSmtpFromEnv(adminUser?: { id: string; email: string }) {
    const host = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const port = Number(this.configService.get<number>('SMTP_PORT')) || 587;
    const secure = port === 465;
    const username = this.configService.get<string>('SMTP_USER') || '';
    const password = this.configService.get<string>('SMTP_PASS') || '';
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

    return this.updateSmtpSettings(
      {
        host,
        port,
        secure,
        username,
        password,
        fromName: parsedFromName,
        fromEmail: parsedFromEmail,
        isEnabled: true,
      },
      adminUser,
    );
  }

  // ───────────────────────────────────────────────
  // STRIPE PROFILE MANAGEMENT
  // ───────────────────────────────────────────────

  async getStripeProfiles() {
    const profiles = await this.prisma.stripeProfile.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    const mapped = profiles.map((p) => ({
      id: p.id,
      label: p.label,
      mode: p.mode,
      publishableKey: p.publishableKey,
      secretKeyMasked: this.cryptoService.maskSecret('sk_dummy_len_32'),
      webhookSecretMasked: this.cryptoService.maskSecret('whsec_dummy_len_32'),
      currency: p.currency,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return {
      profiles: mapped,
      activeProfileId: profiles.find((p) => p.isActive)?.id || null,
      usingFallback: profiles.length === 0,
    };
  }

  async createStripeProfile(dto: CreateStripeProfileDto, adminUser?: { id: string; email: string }) {
    // Mode match check (supports standard secret keys sk_ and restricted keys rk_)
    if (
      dto.mode === StripeMode.TEST &&
      (!/^(sk|rk)_test_/.test(dto.secretKey) || !dto.publishableKey.startsWith('pk_test_'))
    ) {
      throw new BadRequestException('Test mode profiles must use test keys starting with sk_test_/rk_test_ and pk_test_');
    }
    if (
      dto.mode === StripeMode.LIVE &&
      (!/^(sk|rk)_live_/.test(dto.secretKey) || !dto.publishableKey.startsWith('pk_live_'))
    ) {
      throw new BadRequestException('Live mode profiles must use live keys starting with sk_live_/rk_live_ and pk_live_');
    }

    const encSecret = this.cryptoService.encrypt(dto.secretKey.trim());
    const encWebhook = this.cryptoService.encrypt(dto.webhookSecret.trim());

    // If marked active or first profile, manage active flags
    const existingCount = await this.prisma.stripeProfile.count();
    const shouldBeActive = dto.isActive || existingCount === 0;

    if (shouldBeActive) {
      await this.prisma.stripeProfile.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const created = await this.prisma.stripeProfile.create({
      data: {
        label: dto.label.trim(),
        mode: dto.mode,
        publishableKey: dto.publishableKey.trim(),
        encryptedSecretKey: encSecret.encryptedText,
        secretKeyIv: encSecret.iv,
        secretKeyTag: encSecret.tag,
        encryptedWebhookSecret: encWebhook.encryptedText,
        webhookSecretIv: encWebhook.iv,
        webhookSecretTag: encWebhook.tag,
        currency: dto.currency.trim().toLowerCase(),
        isActive: shouldBeActive,
      },
    });

    this.dynamicSettingsService.invalidateCache('STRIPE');

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'CREATE',
      entityType: 'STRIPE',
      entityId: created.id,
      details: { label: created.label, mode: created.mode, currency: created.currency, isActive: created.isActive },
    });

    return created;
  }

  async updateStripeProfile(id: string, dto: UpdateStripeProfileDto, adminUser?: { id: string; email: string }) {
    const profile = await this.prisma.stripeProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Stripe profile not found');
    }

    const dataToUpdate: any = {};
    if (dto.label !== undefined) dataToUpdate.label = dto.label.trim();
    if (dto.mode !== undefined) dataToUpdate.mode = dto.mode;
    if (dto.publishableKey !== undefined) dataToUpdate.publishableKey = dto.publishableKey.trim();
    if (dto.currency !== undefined) dataToUpdate.currency = dto.currency.trim().toLowerCase();

    if (dto.secretKey && !dto.secretKey.includes('••••')) {
      const encSecret = this.cryptoService.encrypt(dto.secretKey.trim());
      dataToUpdate.encryptedSecretKey = encSecret.encryptedText;
      dataToUpdate.secretKeyIv = encSecret.iv;
      dataToUpdate.secretKeyTag = encSecret.tag;
    }

    if (dto.webhookSecret && !dto.webhookSecret.includes('••••')) {
      const encWebhook = this.cryptoService.encrypt(dto.webhookSecret.trim());
      dataToUpdate.encryptedWebhookSecret = encWebhook.encryptedText;
      dataToUpdate.webhookSecretIv = encWebhook.iv;
      dataToUpdate.webhookSecretTag = encWebhook.tag;
    }

    if (dto.isActive !== undefined && dto.isActive !== profile.isActive) {
      if (dto.isActive) {
        await this.prisma.stripeProfile.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
        dataToUpdate.isActive = true;
      } else {
        // Cannot deactivate the only active profile if no other exists
        throw new BadRequestException('Cannot manually deactivate active profile. Activate another profile instead.');
      }
    }

    const updated = await this.prisma.stripeProfile.update({
      where: { id },
      data: dataToUpdate,
    });

    this.dynamicSettingsService.invalidateCache('STRIPE');

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'UPDATE',
      entityType: 'STRIPE',
      entityId: id,
      details: { label: updated.label, mode: updated.mode, currency: updated.currency, isActive: updated.isActive },
    });

    return updated;
  }

  async activateStripeProfile(id: string, adminUser?: { id: string; email: string }) {
    const profile = await this.prisma.stripeProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Stripe profile not found');
    }

    await this.prisma.stripeProfile.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const activated = await this.prisma.stripeProfile.update({
      where: { id },
      data: { isActive: true },
    });

    this.dynamicSettingsService.invalidateCache('STRIPE');

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'ACTIVATE',
      entityType: 'STRIPE',
      entityId: id,
      details: { label: activated.label, mode: activated.mode },
    });

    return activated;
  }

  async deleteStripeProfile(id: string, adminUser?: { id: string; email: string }) {
    const profile = await this.prisma.stripeProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException('Stripe profile not found');
    }

    if (profile.isActive) {
      throw new BadRequestException('Cannot delete the currently active Stripe profile. Switch to another profile first.');
    }

    await this.prisma.stripeProfile.delete({ where: { id } });
    this.dynamicSettingsService.invalidateCache('STRIPE');

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'DELETE',
      entityType: 'STRIPE',
      entityId: id,
      details: { label: profile.label, mode: profile.mode },
    });

    return { message: 'Stripe profile deleted successfully' };
  }

  async duplicateStripeProfile(id: string, adminUser?: { id: string; email: string }) {
    const source = await this.prisma.stripeProfile.findUnique({ where: { id } });
    if (!source) {
      throw new NotFoundException('Stripe profile not found');
    }

    const duplicated = await this.prisma.stripeProfile.create({
      data: {
        label: `${source.label} (Copy)`,
        mode: source.mode,
        publishableKey: source.publishableKey,
        encryptedSecretKey: source.encryptedSecretKey,
        secretKeyIv: source.secretKeyIv,
        secretKeyTag: source.secretKeyTag,
        encryptedWebhookSecret: source.encryptedWebhookSecret,
        webhookSecretIv: source.webhookSecretIv,
        webhookSecretTag: source.webhookSecretTag,
        currency: source.currency,
        isActive: false,
      },
    });

    await this.dynamicSettingsService.recordAuditLog({
      actorId: adminUser?.id,
      actorEmail: adminUser?.email,
      action: 'DUPLICATE',
      entityType: 'STRIPE',
      entityId: duplicated.id,
      details: { sourceId: id, newLabel: duplicated.label },
    });

    return duplicated;
  }

  async verifyStripeConnection(dto: VerifyStripeProfileDto) {
    let secretKey = '';

    if (dto.secretKey && !dto.secretKey.includes('••••')) {
      secretKey = dto.secretKey.trim();
    } else if (dto.profileId) {
      const resolved = await this.dynamicSettingsService.getStripeProfileById(dto.profileId);
      if (!resolved || !resolved.secretKey) {
        throw new NotFoundException('Profile not found or missing secret key');
      }
      secretKey = resolved.secretKey;
    } else {
      const active = await this.dynamicSettingsService.getActiveStripeProfile();
      secretKey = active.secretKey;
    }

    if (!secretKey) {
      throw new BadRequestException('No secret key found to verify');
    }

    try {
      const stripeClient = new (await import('stripe')).default(secretKey, {
        apiVersion: '2025-02-24.acacia' as any,
      });

      const balance = await stripeClient.balance.retrieve();
      return {
        success: true,
        livemode: balance.livemode,
        available: balance.available,
        pending: balance.pending,
        message: `Stripe connection successful (${balance.livemode ? 'LIVE' : 'TEST'} mode verified)`,
      };
    } catch (err: any) {
      throw new BadRequestException(`Stripe verification failed: ${err.message}`);
    }
  }

  async importStripeFromEnv(adminUser?: { id: string; email: string }) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    const publishableKey = this.configService.get<string>('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') || '';
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    const currency = (this.configService.get<string>('STRIPE_CURRENCY') || 'eur').toLowerCase();

    if (!secretKey) {
      throw new BadRequestException('STRIPE_SECRET_KEY is not defined in environment');
    }

    const mode = /^(sk|rk)_live_/.test(secretKey) ? StripeMode.LIVE : StripeMode.TEST;

    return this.createStripeProfile(
      {
        label: `Imported from .env (${mode})`,
        mode,
        publishableKey: publishableKey || (mode === StripeMode.LIVE ? 'pk_live_placeholder' : 'pk_test_placeholder'),
        secretKey,
        webhookSecret: webhookSecret || 'whsec_placeholder',
        currency,
        isActive: true,
      },
      adminUser,
    );
  }

  // ───────────────────────────────────────────────
  // PUBLIC STRIPE CONFIG
  // ───────────────────────────────────────────────

  async getPublicStripeConfig() {
    const active = await this.dynamicSettingsService.getActiveStripeProfile();
    return {
      publishableKey: active.publishableKey,
      currency: active.currency,
      mode: active.mode,
    };
  }

  async getAuditLogs(entityType?: 'SMTP' | 'STRIPE') {
    return this.prisma.settingsAuditLog.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
