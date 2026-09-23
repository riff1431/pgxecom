import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    this.stripe = new Stripe(stripeSecretKey || '', {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature header');
    }

    let event: Stripe.Event;

    try {
      if (this.webhookSecret && this.webhookSecret !== 'whsec_test_placeholder_or_live_secret') {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
      } else {
        // Fallback for dev/unconfigured test secrets (parses event payload)
        this.logger.warn('STRIPE_WEBHOOK_SECRET not configured with a valid secret. Using JSON parse fallback for event.');
        event = JSON.parse(rawBody.toString()) as Stripe.Event;
      }
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`Received Stripe webhook event: ${event.type} [${event.id}]`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.processCheckoutSessionCompleted(session);
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private async processCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.user_id;
    const amountEurStr = session.metadata?.amount_eur;
    const isWalletTopUp = session.metadata?.type === 'wallet_topup';

    if (!isWalletTopUp || !userId) {
      this.logger.log(`Checkout session ${session.id} is not a wallet topup or has no user_id; skipping wallet credit.`);
      return;
    }

    // Determine amount in EUR (convert from total cents if metadata missing)
    const amountTotalCents = session.amount_total ?? 0;
    const amountVal = amountEurStr ? parseFloat(amountEurStr) : amountTotalCents / 100;

    if (!amountVal || amountVal <= 0) {
      this.logger.error(`Invalid deposit amount (${amountVal}) in checkout session ${session.id}`);
      return;
    }

    const supabase = this.supabaseService.getAdminClient();
    if (!supabase) {
      this.logger.error('Cannot process webhook topup: Supabase Admin Client is not initialized.');
      throw new InternalServerErrorException('Database client unavailable');
    }

    // Idempotency check: see if a transaction with this session ID already exists in transactions table
    const descText = `Stripe Top-Up (Session: ${session.id})`;
    const { data: existingTx, error: checkError } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('description', descText)
      .maybeSingle();

    if (checkError) {
      this.logger.warn(`Could not verify idempotency for session ${session.id}: ${checkError.message}`);
    }

    if (existingTx && existingTx.status === 'completed') {
      this.logger.warn(`Top-up for session ${session.id} already processed. Skipping duplicate execution.`);
      return;
    }

    this.logger.log(`Crediting wallet for user ${userId}: €${amountVal.toFixed(2)} via add_funds RPC`);

    try {
      const { error: rpcError } = await supabase.rpc('add_funds', {
        user_uuid: userId,
        amount_val: amountVal,
        desc_text: descText,
      });

      if (rpcError) {
        this.logger.error(`add_funds RPC failed for user ${userId}, session ${session.id}:`, rpcError);
        throw new InternalServerErrorException(`Database RPC failed: ${rpcError.message}`);
      }

      this.logger.log(`Successfully credited €${amountVal.toFixed(2)} to user ${userId} wallet`);
    } catch (err: any) {
      this.logger.error(`Failed to credit wallet for session ${session.id}:`, err);
      throw err;
    }
  }
}
