import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateCouponDto } from './dto/create-coupon.dto';
import { SetCouponStatusDto } from './dto/set-coupon-status.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import type {
  AdminCouponsListResponse,
  CouponValidationResult,
  SerializedCoupon,
} from './service';
import { CouponsService } from './service';

@Controller('coupons')
export class CouponsController {
  constructor(private couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('validate')
  validate(
    @Req() req: { user: { id: string } },
    @Body() data: ValidateCouponDto,
  ): Promise<CouponValidationResult> {
    return this.couponsService.validateForUser(
      req.user.id,
      data.code,
      data.subtotal,
    );
  }
}

@Controller('admin/coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminCouponsController {
  constructor(private couponsService: CouponsService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<AdminCouponsListResponse> {
    return this.couponsService.findAll({ page, limit, search, status });
  }

  @Post()
  create(@Body() data: CreateCouponDto): Promise<SerializedCoupon> {
    return this.couponsService.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCouponDto,
  ): Promise<SerializedCoupon> {
    return this.couponsService.update(id, data);
  }

  @Put(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() data: SetCouponStatusDto,
  ): Promise<SerializedCoupon> {
    return this.couponsService.setStatus(id, data.isActive);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.couponsService.delete(id);
  }
}
