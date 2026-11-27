import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TopUpDto } from './dto/top-up.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  @Get('balance')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current user wallet balance from Supabase' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@Req() req: any) {
    const userId = req.user.id;
    return this.walletService.getBalance(userId);
  }

  @Post('topup')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe Checkout session for wallet top-up' })
  @ApiResponse({ status: 200, description: 'Stripe Checkout URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount (min 1 EUR)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTopUpSession(@Req() req: any, @Body() dto: TopUpDto) {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.walletService.createTopUpSession(userId, userEmail, dto);
  }

  @Get('return-target')
  @ApiOperation({ summary: 'Resolve post-checkout return URL by order reference' })
  @ApiResponse({ status: 200, description: 'Resolved return target URL if valid and unexpired' })
  async getReturnTarget(@Query('order') orderRef?: string) {
    return this.walletService.resolveReturnTarget(orderRef || '');
  }

  @Get('pay')
  @ApiOperation({ summary: 'Anonymized payment relay page that strips merchant origin and redirects to Stripe Checkout' })
  handlePay(@Query('s') encodedUrl: string, @Res() res: Response) {
    let targetStripeUrl = 'https://playgroundfitnex.com';
    if (encodedUrl) {
      try {
        const decoded = Buffer.from(encodedUrl, 'base64url').toString('utf-8');
        if (decoded.startsWith('https://checkout.stripe.com/')) {
          targetStripeUrl = decoded;
        }
      } catch {
        // Fallback to storefront home
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Referrer-Policy', 'no-referrer');
    return res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <title>PlaygroundFitnex — Secure Checkout</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.15);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 13px; color: #94a3b8; margin: 0; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p>Connecting to secure checkout...</p>
  <script>
    var target = ${JSON.stringify(targetStripeUrl)};
    if (window.top !== window.self) {
      window.top.location.replace(target);
    } else {
      window.location.replace(target);
    }
  </script>
</body>
</html>`);
  }
}
