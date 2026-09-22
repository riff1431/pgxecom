import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController, AdminBannersController } from './banners.controller';

@Module({
  controllers: [BannersController, AdminBannersController],
  providers: [BannersService],
})
export class BannersModule {}
