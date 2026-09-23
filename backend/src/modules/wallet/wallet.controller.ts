import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TopUpDto } from './dto/top-up.dto';
import { WalletService } from './wallet.service';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth('bearer')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get current user wallet balance from Supabase' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBalance(@Req() req: any) {
    const userId = req.user.id;
    return this.walletService.getBalance(userId);
  }

  @Post('topup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe Checkout session for wallet top-up' })
  @ApiResponse({ status: 200, description: 'Stripe Checkout URL generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount (min 25 EUR)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTopUpSession(@Req() req: any, @Body() dto: TopUpDto) {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.walletService.createTopUpSession(userId, userEmail, dto);
  }
}
