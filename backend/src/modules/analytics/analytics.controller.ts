import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  getOverview(@Query() query: AnalyticsQueryDto): Promise<unknown> {
    return this.analyticsService.getOverview(query);
  }

  @Get('dashboard')
  getDashboardStats(@Query() query: AnalyticsQueryDto): Promise<unknown> {
    return this.analyticsService.getDashboardStats(query);
  }

  @Get('revenue')
  getRevenueChart(@Query() query: AnalyticsQueryDto): Promise<unknown> {
    return this.analyticsService.getRevenueChart(query);
  }

  @Get('orders-by-status')
  getOrdersByStatus(@Query() query: AnalyticsQueryDto): Promise<unknown> {
    return this.analyticsService.getOrdersByStatus(query);
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.analyticsService.getLowStockProducts();
  }
}
