import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() data: CreateOrderDto) {
    return this.ordersService.create({
      ...data,
      shippingAddress: data.shippingAddress as
        | Prisma.InputJsonValue
        | undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyOrders(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findByUser(req.user.id, { page, limit, status });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/:id')
  findMyOrder(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.adminFindById(id);
  }

  @Get('track/:orderNumber')
  trackOrder(
    @Param('orderNumber') orderNumber: string,
    @Query('phone') phone: string,
  ) {
    return this.ordersService.trackOrder(orderNumber, phone);
  }
}

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminOrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.adminFindAll({ page, limit, status, search });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ordersService.adminFindById(id);
  }

  @Get(':id/invoice')
  getInvoice(@Param('id') id: string) {
    return this.ordersService.adminGetInvoice(id);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() data: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    return this.ordersService.updateStatus(
      id,
      data.status,
      data.note,
      req.user.id,
    );
  }
}
