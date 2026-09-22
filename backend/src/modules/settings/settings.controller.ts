import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BulkUpsertSettingsDto } from './dto/bulk-upsert-settings.dto';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findPublic() {
    return this.settingsService.findPublic();
  }
}

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminSettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  findAll(@Query('group') group?: string, @Query('search') search?: string) {
    return this.settingsService.findAll({ group, search });
  }

  @Get(':key')
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

  @Put(':key')
  update(@Param('key') key: string, @Body() data: UpdateSettingDto) {
    return this.settingsService.updateByKey(key, data);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.deleteByKey(key);
  }
}
