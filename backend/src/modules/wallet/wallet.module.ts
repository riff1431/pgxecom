import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { SettingsModule } from '../settings/settings.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [AuthModule, SettingsModule],
  controllers: [WalletController],
  providers: [WalletService, SupabaseAuthGuard],
  exports: [WalletService],
})
export class WalletModule {}
