import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { DynamicSettingsService } from '../settings/dynamic-settings.service';
import { SupabaseService } from '../supabase/supabase.service';
import { TopUpDto } from './dto/top-up.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ORDER_REF_REGEX = /^(?:ORD-\d{4}|FNX-[A-Z0-9]{6,16})$/;
const CHECKOUT_RETURN_GROUP = '_internal_checkout_return';
const CHECKOUT_RETURN_KEY_PREFIX = 'checkout_ret:';
const CHECKOUT_RETURN_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly returnUrlCache = new Map<string, { returnUrl: string; expiresAt: number }>();

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly dynamicSettingsService: DynamicSettingsService,
  ) {}

  /**
   * Helper to resolve the correct Supabase UUID for a given local user ID or Supabase ID.
   */
  async resolveSupabaseUserId(userIdOrCuid: string): Promise<string | null> {
    if (UUID_REGEX.test(userIdOrCuid)) {
      return userIdOrCuid;
    }

    // Try finding user by local Prisma cuid
    const localUser = await this.prisma.user.findUnique({
      where: { id: userIdOrCuid },
      select: { id: true, email: true, supabaseUserId: true },
    });

    if (localUser?.supabaseUserId && UUID_REGEX.test(localUser.supabaseUserId)) {
      return localUser.supabaseUserId;
    }

    // If local user exists, look up by email in Supabase Auth to find their UUID
    if (localUser?.email) {
      const supabase = this.supabaseService.getAdminClient();
      if (supabase) {
        try {
          const { data: usersData } = await supabase.auth.admin.listUsers();
          const matched = (usersData?.users as any[])?.find(
            (u: any) => u.email?.toLowerCase().trim() === localUser.email.toLowerCase().trim(),
          );
          if (matched?.id) {
            await this.prisma.user.update({
              where: { id: localUser.id },
              data: { supabaseUserId: matched.id },
            });
            return matched.id;
          }
        } catch (lookupErr) {
          this.logger.warn(`Could not lookup Supabase user by email for ${localUser.email}:`, lookupErr);
        }
      }
    }

    return null;
  }

  async getBalance(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    if (!supabase) {
      this.logger.warn('Supabase is not configured; returning fallback balance 0');
      return {
        userId,
        balance: 0,
        currency: 'EUR',
      };
    }

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;
    if (!UUID_REGEX.test(targetUserId)) {
      this.logger.warn(`User ${userId} does not have a valid Supabase UUID; returning fallback balance 0`);
      return {
        userId,
        balance: 0,
        currency: 'EUR',
      };
    }

    // Reconcile and fetch authoritative balance
    try {
      const { data: recBal, error: rpcErr } = await supabase.rpc('reconcile_wallet_balance', {
        p_user_id: targetUserId,
      });

      if (!rpcErr && recBal !== null && recBal !== undefined) {
        return {
          userId,
          balance: Number(recBal),
          currency: 'EUR',
        };
      }
    } catch (err) {
      this.logger.warn(`reconcile_wallet_balance RPC call failed for user ${targetUserId}:`, err);
    }

    // Fallback: direct select or create wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('id, balance, currency, updated_at')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to fetch wallet for user ${targetUserId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve wallet balance');
    }

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: targetUserId, balance: 0, currency: 'EUR' })
        .select('id, balance, currency, updated_at')
        .single();

      if (createError) {
        this.logger.error(`Failed to create initial wallet for user ${targetUserId}:`, createError);
        throw new InternalServerErrorException('Failed to initialize user wallet');
      }

      return {
        userId,
        balance: 0,
        currency: newWallet.currency || 'EUR',
      };
    }

    return {
      userId,
      balance: Number(wallet.balance ?? 0),
      currency: wallet.currency || 'EUR',
    };
  }

  private getAllowedReturnHosts(): Set<string> {
    const hosts = new Set<string>([
      'localhost',
      '127.0.0.1',
      'playgroundfitnex.com',
      'www.playgroundfitnex.com',
      'pgxsports.shop',
      'www.pgxsports.shop',
      'playgroundx.vip',
      'www.playgroundx.vip',
    ]);

    const extraOrigins = [
      this.configService.get<string>('FRONTEND_URL') || '',
      this.configService.get<string>('ALLOWED_RETURN_ORIGINS') || '',
    ]
      .join(',')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const origin of extraOrigins) {
      try {
        hosts.add(new URL(origin).hostname.toLowerCase());
      } catch {
        // Ignore malformed env entries
      }
    }

    return hosts;
  }

  private sanitizeReturnUrl(rawUrl?: string): string {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) return '';

    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.toLowerCase();
      const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';

      if (parsed.protocol !== 'https:' && !(isLocal && parsed.protocol === 'http:')) {
        this.logger.warn(`Rejected returnUrl with disallowed protocol: ${parsed.protocol}`);
        return '';
      }

      const allowedHosts = this.getAllowedReturnHosts();
      if (!allowedHosts.has(hostname)) {
        this.logger.warn(`Rejected returnUrl with unapproved host: ${hostname}`);
        return '';
      }

      return parsed.toString();
    } catch {
      this.logger.warn('Rejected malformed returnUrl');
      return '';
    }
  }

  private async saveReturnTarget(orderRef: string, returnUrl: string): Promise<void> {
    const now = Date.now();
    const expiresAt = now + CHECKOUT_RETURN_TTL_MS;
    this.returnUrlCache.set(orderRef, { returnUrl, expiresAt });

    // Opportunistic in-memory cleanup
    if (this.returnUrlCache.size > 200) {
      for (const [key, entry] of this.returnUrlCache.entries()) {
        if (entry.expiresAt <= now) {
          this.returnUrlCache.delete(key);
        }
      }
    }

    try {
      await this.prisma.storeSetting.upsert({
        where: { key: `${CHECKOUT_RETURN_KEY_PREFIX}${orderRef}` },
        update: {
          value: JSON.stringify({ returnUrl, expiresAt }),
          group: CHECKOUT_RETURN_GROUP,
        },
        create: {
          key: `${CHECKOUT_RETURN_KEY_PREFIX}${orderRef}`,
          value: JSON.stringify({ returnUrl, expiresAt }),
          group: CHECKOUT_RETURN_GROUP,
        },
      });

      // Periodically prune expired return targets in the background
      if (Math.random() < 0.1) {
        void this.pruneExpiredReturnTargets(now);
      }
    } catch (err: any) {
      this.logger.warn(`Could not persist return target for ${orderRef} to DB (using in-memory cache): ${err.message}`);
    }
  }

  private async pruneExpiredReturnTargets(now: number): Promise<void> {
    try {
      const rows = await this.prisma.storeSetting.findMany({
        where: { group: CHECKOUT_RETURN_GROUP },
        select: { id: true, value: true },
        take: 100,
      });

      const expiredIds: string[] = [];
      for (const row of rows) {
        try {
          const parsed = JSON.parse(row.value) as { expiresAt?: number };
          if (!parsed.expiresAt || parsed.expiresAt <= now) {
            expiredIds.push(row.id);
          }
        } catch {
          expiredIds.push(row.id);
        }
      }

      if (expiredIds.length > 0) {
        await this.prisma.storeSetting.deleteMany({
          where: { id: { in: expiredIds } },
        });
      }
    } catch {
      // Non-critical background cleanup
    }
  }

  async resolveReturnTarget(orderRef: string): Promise<{ returnUrl: string | null }> {
    const normalized = (orderRef || '').trim().toUpperCase();
    if (!ORDER_REF_REGEX.test(normalized)) {
      return { returnUrl: null };
    }

    const now = Date.now();
    const cached = this.returnUrlCache.get(normalized);
    if (cached) {
      if (cached.expiresAt > now) {
        return { returnUrl: cached.returnUrl };
      }
      this.returnUrlCache.delete(normalized);
    }

    try {
      const record = await this.prisma.storeSetting.findUnique({
        where: { key: `${CHECKOUT_RETURN_KEY_PREFIX}${normalized}` },
      });

      if (!record || record.group !== CHECKOUT_RETURN_GROUP) {
        return { returnUrl: null };
      }

      const parsed = JSON.parse(record.value) as { returnUrl?: string; expiresAt?: number };
      if (!parsed.expiresAt || parsed.expiresAt <= now) {
        await this.prisma.storeSetting
          .delete({ where: { key: record.key } })
          .catch(() => undefined);
        return { returnUrl: null };
      }

      const safeUrl = this.sanitizeReturnUrl(parsed.returnUrl);
      if (!safeUrl) {
        return { returnUrl: null };
      }

      this.returnUrlCache.set(normalized, {
        returnUrl: safeUrl,
        expiresAt: parsed.expiresAt,
      });

      return { returnUrl: safeUrl };
    } catch (err: any) {
      this.logger.warn(`Failed to resolve return target for ${normalized}: ${err.message}`);
      return { returnUrl: null };
    }
  }

  private getFitnessPackageDetails(amount: number, currency: string) {
    const formattedAmount = `${currency.toUpperCase()} ${amount.toFixed(2)}`;
    const orderRef = `FNX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    if (amount < 30) {
      return {
        name: 'Fitnex Core Resistance Bands & Fitness Accessories Kit',
        description: `Order #${orderRef} • Core Training Equipment & Accessories (${formattedAmount}) • Standard Delivery Included`,
        orderRef,
      };
    } else if (amount < 75) {
      return {
        name: 'Fitnex Pro Athletic Conditioning & Speed Training Package',
        description: `Order #${orderRef} • Athlete Performance Training Gear Bundle (${formattedAmount}) • Express Courier Dispatch`,
        orderRef,
      };
    } else if (amount < 150) {
      return {
        name: 'Fitnex High-Performance Strength & Conditioning Suite',
        description: `Order #${orderRef} • Premium Strength & Conditioning Equipment Set (${formattedAmount}) • Free International Shipping`,
        orderRef,
      };
    } else if (amount < 300) {
      return {
        name: 'Fitnex Elite Gym Equipment & Barbell Collar Performance Bundle',
        description: `Order #${orderRef} • Commercial Grade Athlete Training Suite (${formattedAmount}) • Priority Courier Dispatch`,
        orderRef,
      };
    } else {
      return {
        name: 'Fitnex Master Athlete Complete Training & Recovery Suite',
        description: `Order #${orderRef} • Full Athlete High-Performance Gym & Recovery Suite (${formattedAmount}) • VIP Freight Dispatch`,
        orderRef,
      };
    }
  }

  async createTopUpSession(userId: string, userEmail: string | undefined, dto: TopUpDto) {
    const rawFrontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'https://playgroundfitnex.com')
      .split(',')[0]
      .trim();
    const frontendUrl = (rawFrontendUrl || 'https://playgroundfitnex.com').replace(/\/+$/, '');
    const backendApiUrl = (
      this.configService.get<string>('BACKEND_URL') || 'https://api.playgroundfitnex.com'
    ).replace(/\/+$/, '');
    const amountInCents = Math.round(dto.amount * 100);
    const safeReturnUrl = this.sanitizeReturnUrl(dto.returnUrl);

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;

    try {
      const { client: stripeClient, profile } = await this.dynamicSettingsService.getStripeClient();
      const currency = (profile.currency || 'eur').toLowerCase();
      const cleanOrderNum = String(crypto.randomInt(1000, 10000));
      const orderRef = `ORD-${cleanOrderNum}`;
      const displayOrderName = `Order #${cleanOrderNum}`;

      // Persist return URL server-side keyed by opaque orderRef so zero external domain reaches Stripe
      if (safeReturnUrl) {
        await this.saveReturnTarget(orderRef, safeReturnUrl);
      }

      // Mask origin: Stripe MUST only see playgroundfitnex.com domain + clean order reference
      // Point success/cancel to backend /api/wallet/return for an instant 302 redirect (no Fitnex confirmation page flash)
      const encodedOrderRef = encodeURIComponent(orderRef);
      const successUrl = `${backendApiUrl}/api/wallet/return?status=success&session_id={CHECKOUT_SESSION_ID}&order=${encodedOrderRef}`;
      const cancelUrl = `${backendApiUrl}/api/wallet/return?status=cancelled&order=${encodedOrderRef}`;

      const cloakedMetadata: Record<string, string> = {
        user_id: targetUserId,
        amount_eur: dto.amount.toString(),
        order_type: 'fitness_package',
        oid: orderRef,
      };

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: displayOrderName,
                description: `Payment for ${displayOrderName}`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: cloakedMetadata,
        payment_intent_data: {
          description: displayOrderName,
          metadata: cloakedMetadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      const encodedStripeUrl = session.url ? Buffer.from(session.url).toString('base64url') : '';
      const cloakedCheckoutUrl = encodedStripeUrl
        ? `${backendApiUrl}/api/wallet/pay?s=${encodedStripeUrl}`
        : session.url;

      this.logger.log(`Created Stripe Checkout session ${session.id} for user ${userId}, ${displayOrderName}, amount: €${dto.amount}`);

      return {
        sessionId: session.id,
        url: cloakedCheckoutUrl,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Stripe Checkout session for user ${userId}:`, err);
      throw new InternalServerErrorException(err.message || 'Failed to create Stripe payment session');
    }
  }

  /**
   * Atomically debits a user's wallet for an order payment.
   */
  async deductFunds(userId: string, amount: number, orderNumber: string, description?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be greater than 0');
    }

    const supabase = this.supabaseService.getAdminClient();
    if (!supabase) {
      this.logger.error('Supabase admin client unavailable');
      throw new InternalServerErrorException('Payment processing service is unavailable');
    }

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;
    if (!UUID_REGEX.test(targetUserId)) {
      throw new BadRequestException('A valid PGX user account is required to pay with wallet');
    }

    const descText = description || `Order Payment (#${orderNumber})`;

    // Check current balance first
    const { balance } = await this.getBalance(targetUserId);
    if (balance < amount) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: €${amount.toFixed(2)}, Current Balance: €${balance.toFixed(2)}. Please top up your wallet.`,
      );
    }

    // Try deduct_funds RPC if available in database
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('deduct_funds', {
        user_uuid: targetUserId,
        amount_val: amount,
        desc_text: descText,
      });

      if (!rpcErr) {
        this.logger.log(`deduct_funds RPC succeeded for user ${targetUserId}, order ${orderNumber}, amount €${amount}`);
        return { success: true, targetUserId };
      }
      this.logger.warn(`deduct_funds RPC returned error, falling back to direct transaction: ${rpcErr.message}`);
    } catch (rpcCallErr) {
      this.logger.warn('deduct_funds RPC failed, executing direct Supabase balance decrement:', rpcCallErr);
    }

    // Fallback: fetch wallet, verify balance, update balance, and record transaction
    const { data: wallet, error: getWalletErr } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', targetUserId)
      .single();

    if (getWalletErr || !wallet) {
      this.logger.error(`Wallet not found for user ${targetUserId}:`, getWalletErr);
      throw new BadRequestException('Wallet account not found. Please top up first.');
    }

    const currentWalletBal = Number(wallet.balance ?? 0);
    if (currentWalletBal < amount) {
      throw new BadRequestException(
        `Insufficient wallet balance. Required: €${amount.toFixed(2)}, Current Balance: €${currentWalletBal.toFixed(2)}.`,
      );
    }

    const newBalance = Number((currentWalletBal - amount).toFixed(2));

    const { error: updateErr } = await supabase
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('id', wallet.id);

    if (updateErr) {
      this.logger.error(`Failed to update wallet balance for user ${targetUserId}:`, updateErr);
      throw new InternalServerErrorException('Failed to process wallet payment transaction');
    }

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: targetUserId,
      type: 'debit',
      amount: amount,
      status: 'completed',
      description: descText,
      metadata: { order_number: orderNumber, type: 'order_payment' },
    });

    this.logger.log(`Successfully deducted €${amount} from user ${targetUserId} for order ${orderNumber}`);
    return { success: true, targetUserId, newBalance };
  }

  /**
   * Credits funds back to the user's wallet upon order cancellation/refund.
   */
  async refundFunds(userId: string, amount: number, orderNumber: string, reason?: string) {
    if (amount <= 0) return;

    const supabase = this.supabaseService.getAdminClient();
    if (!supabase) return;

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;
    if (!UUID_REGEX.test(targetUserId)) return;

    const descText = reason || `Order Refund (#${orderNumber})`;

    try {
      const { error: rpcErr } = await supabase.rpc('add_funds', {
        user_uuid: targetUserId,
        amount_val: amount,
        desc_text: descText,
      });

      if (!rpcErr) {
        this.logger.log(`Successfully refunded €${amount} to user ${targetUserId} for order ${orderNumber}`);
        return;
      }
    } catch (err) {
      this.logger.warn(`add_funds RPC refund error, trying direct increment:`, err);
    }

    // Direct fallback
    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (wallet) {
      const newBal = Number((Number(wallet.balance ?? 0) + amount).toFixed(2));
      await supabase
        .from('wallets')
        .update({ balance: newBal, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

      await supabase.from('transactions').insert({
        user_id: targetUserId,
        type: 'credit',
        amount: amount,
        status: 'completed',
        description: descText,
        metadata: { order_number: orderNumber, type: 'order_refund' },
      });
    }
  }
}
