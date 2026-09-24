import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { TopUpDto } from './dto/top-up.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined in configuration');
    }
    this.stripe = new Stripe(stripeSecretKey || '', {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

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

  async createTopUpSession(userId: string, userEmail: string | undefined, dto: TopUpDto) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const amountInCents = Math.round(dto.amount * 100);

    const successReturnUrl = dto.returnUrl || `${frontendUrl}/my-account/wallet`;
    const cancelReturnUrl = dto.returnUrl || `${frontendUrl}/my-account/wallet`;

    const successUrl = `${successReturnUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${cancelReturnUrl}?status=cancelled`;

    const targetUserId = (await this.resolveSupabaseUserId(userId)) || userId;

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'PGX Wallet Deposit',
                description: `Add €${dto.amount.toFixed(2)} credits to your universal PGX wallet`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          user_id: targetUserId,
          amount_eur: dto.amount.toString(),
          type: 'wallet_topup',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      this.logger.log(`Created Stripe Checkout session ${session.id} for user ${userId}, amount: €${dto.amount}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Stripe Checkout session for user ${userId}:`, err);
      throw new InternalServerErrorException(err.message || 'Failed to create Stripe payment session');
    }
  }
}
