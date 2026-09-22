import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ToggleShippingZoneDto } from './dto/toggle-shipping-zone.dto';
import { ShippingService } from './shipping.service';

class CreateShippingZoneDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateShippingZoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('shipping-zones')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }
}

@Controller('admin/shipping-zones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get()
  findAll() {
    return this.shippingService.findAdminAll();
  }

  @Post()
  create(@Body() data: CreateShippingZoneDto) {
    return this.shippingService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateShippingZoneDto) {
    return this.shippingService.update(id, data);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string, @Body() body: ToggleShippingZoneDto) {
    return this.shippingService.update(id, { isActive: body.isActive });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingService.remove(id);
  }
}
