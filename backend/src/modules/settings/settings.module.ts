import { Module } from '@nestjs/common';
import { CryptoService } from '../../common/crypto/crypto.service';
import { DynamicSettingsService } from './dynamic-settings.service';
import {
  AdminSettingsController,
  SettingsController,
} from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController, AdminSettingsController],
  providers: [SettingsService, DynamicSettingsService, CryptoService],
  exports: [SettingsService, DynamicSettingsService, CryptoService],
})
export class SettingsModule {}
