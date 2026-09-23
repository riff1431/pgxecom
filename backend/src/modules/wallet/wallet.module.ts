import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [AuthModule],
  controllers: [WalletController],
  providers: [WalletService, SupabaseAuthGuard],
  exports: [WalletService],
})
export class WalletModule {}
