import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { WebhookService } from './webhook.service';

@ApiTags('Webhooks')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe payment webhook listener' })
  @ApiResponse({ status: 200, description: 'Webhook received and processed' })
  @ApiResponse({ status: 400, description: 'Invalid signature or payload' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody || Buffer.from('');
    return this.webhookService.handleStripeWebhook(signature, rawBody);
  }
}
