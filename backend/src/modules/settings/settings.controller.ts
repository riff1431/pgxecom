import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { TestSmtpDto, UpdateSmtpSettingsDto } from './dto/smtp-settings.dto';
import {
  CreateStripeProfileDto,
  UpdateStripeProfileDto,
  VerifyStripeProfileDto,
} from './dto/stripe-profile.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findPublic() {
    return this.settingsService.findPublic();
  }

  @Get('stripe-public')
  getStripePublic() {
    return this.settingsService.getPublicStripeConfig();
  }
}

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSettingsController {
  constructor(private settingsService: SettingsService) {}

  // ── Existing Key-Value Store Settings ──

  @Get()
  findAll(@Query('group') group?: string, @Query('search') search?: string) {
    return this.settingsService.findAll({ group, search });
  }

  @Get('key/:key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOneByKey(key);
  }

  @Post()
  create(@Body() data: CreateSettingDto) {
    return this.settingsService.create(data);
  }

  @Post('bulk-upsert')
  bulkUpsert(@Body() data: BulkUpsertSettingsDto) {
    return this.settingsService.bulkUpsert(data);
  }

  @Put([':key', 'key/:key'])
  update(@Param('key') key: string, @Body() data: UpdateSettingDto) {
    return this.settingsService.updateByKey(key, data);
  }

  @Delete([':key', 'key/:key'])
  delete(@Param('key') key: string) {
    return this.settingsService.deleteByKey(key);
  }

  // ── SMTP Settings Endpoints ──

  @Get('smtp')
  getSmtpSettings() {
    return this.settingsService.getSmtpSettings();
  }

  @Put('smtp')
  updateSmtpSettings(@Req() req: any, @Body() data: UpdateSmtpSettingsDto) {
    return this.settingsService.updateSmtpSettings(data, req.user);
  }

  @Post('smtp/test')
  @HttpCode(HttpStatus.OK)
  testSmtpSettings(@Req() req: any, @Body() data: TestSmtpDto) {
    return this.settingsService.testSmtpSettings(data, req.user);
  }

  @Post('smtp/import-env')
  @HttpCode(HttpStatus.OK)
  importSmtpFromEnv(@Req() req: any) {
    return this.settingsService.importSmtpFromEnv(req.user);
  }

  // ── Stripe Profiles Endpoints ──

  @Get('stripe/profiles')
  getStripeProfiles() {
    return this.settingsService.getStripeProfiles();
  }

  @Post('stripe/profiles')
  createStripeProfile(@Req() req: any, @Body() data: CreateStripeProfileDto) {
    return this.settingsService.createStripeProfile(data, req.user);
  }

  @Put('stripe/profiles/:id')
  updateStripeProfile(
    @Req() req: any,
    @Param('id') id: string,
    @Body() data: UpdateStripeProfileDto,
  ) {
    return this.settingsService.updateStripeProfile(id, data, req.user);
  }

  @Post('stripe/profiles/:id/activate')
  @HttpCode(HttpStatus.OK)
  activateStripeProfile(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.activateStripeProfile(id, req.user);
  }

  @Post('stripe/profiles/:id/duplicate')
  @HttpCode(HttpStatus.OK)
  duplicateStripeProfile(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.duplicateStripeProfile(id, req.user);
  }

  @Delete('stripe/profiles/:id')
  deleteStripeProfile(@Req() req: any, @Param('id') id: string) {
    return this.settingsService.deleteStripeProfile(id, req.user);
  }

  @Post('stripe/verify')
  @HttpCode(HttpStatus.OK)
  verifyStripeConnection(@Body() data: VerifyStripeProfileDto) {
    return this.settingsService.verifyStripeConnection(data);
  }

  @Post('stripe/import-env')
  @HttpCode(HttpStatus.OK)
  importStripeFromEnv(@Req() req: any) {
    return this.settingsService.importStripeFromEnv(req.user);
  }

  // ── Audit Logs ──

  @Get('audit-logs')
  getAuditLogs(@Query('entityType') entityType?: 'SMTP' | 'STRIPE') {
    return this.settingsService.getAuditLogs(entityType);
  }
}
