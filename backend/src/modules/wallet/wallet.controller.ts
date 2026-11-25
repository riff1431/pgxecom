import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Resolve post-checkout return URL by Fitnex order reference' })
  @ApiResponse({ status: 200, description: 'Resolved return target URL if valid and unexpired' })
  async getReturnTarget(@Query('order') orderRef?: string) {
    return this.walletService.resolveReturnTarget(orderRef || '');
  }
}
