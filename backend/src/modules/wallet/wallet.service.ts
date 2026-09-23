import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';
import { TopUpDto } from './dto/top-up.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.error('STRIPE_SECRET_KEY is not defined in configuration');
    }
    this.stripe = new Stripe(stripeSecretKey || '', {
      apiVersion: '2025-02-24.acacia' as any,
    });
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

    // Reconcile and fetch authoritative balance
    try {
      const { data: recBal, error: rpcErr } = await supabase.rpc('reconcile_wallet_balance', {
        p_user_id: userId,
      });

      if (!rpcErr && recBal !== null && recBal !== undefined) {
        return {
          userId,
          balance: Number(recBal),
          currency: 'EUR',
        };
      }
    } catch (err) {
      this.logger.warn(`reconcile_wallet_balance RPC call failed for user ${userId}:`, err);
    }

    // Fallback: direct select or create wallet
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('id, balance, currency, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Failed to fetch wallet for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve wallet balance');
    }

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: userId, balance: 0, currency: 'EUR' })
        .select('id, balance, currency, updated_at')
        .single();

      if (createError) {
        this.logger.error(`Failed to create initial wallet for user ${userId}:`, createError);
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
          user_id: userId,
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
