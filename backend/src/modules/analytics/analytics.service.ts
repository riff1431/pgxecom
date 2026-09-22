import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import {
  AnalyticsQueryDto,
  AnalyticsRangeValue,
} from './dto/analytics-query.dto';

interface DateRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  key: AnalyticsRangeValue | 'custom';
}

interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

interface ComparisonPoint {
  date: string;
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
}

interface BreakdownPoint {
  label: string;
  value: number;
}

interface HourlyPoint {
  hour: string;
  revenue: number;
  orders: number;
}

interface WeekdayPoint {
  day: string;
  revenue: number;
  orders: number;
}

interface TopProductPoint {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
}

interface TopCategoryPoint {
  categoryId: string;
  categoryName: string;
  revenue: number;
  quantity: number;
}

interface CustomerGrowthPoint {
  date: string;
  newCustomers: number;
  cumulativeCustomers: number;
}

interface OrderValueDistributionPoint {
  bucket: string;
  count: number;
}

interface KpiSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paidOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  newCustomers: number;
  cancellationRate: number;
  revenueChangePercent: number;
  orderChangePercent: number;
  customerGrowthPercent: number;
  aovChangePercent: number;
}

interface AnalyticsOverview {
  range: {
    key: DateRange['key'];
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  };
  kpis: KpiSummary;
  revenueTrend: RevenuePoint[];
  revenueComparisonTrend: ComparisonPoint[];
  statusBreakdown: BreakdownPoint[];
  paymentMethodBreakdown: BreakdownPoint[];
  paymentStatusBreakdown: BreakdownPoint[];
  hourlyPerformance: HourlyPoint[];
  weekdayPerformance: WeekdayPoint[];
  topProducts: TopProductPoint[];
  topCategories: TopCategoryPoint[];
  customerGrowthTrend: CustomerGrowthPoint[];
  orderValueDistribution: OrderValueDistributionPoint[];
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category?: { id: string; name: string } | null;
    image?: string | null;
  }>;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(query: AnalyticsQueryDto): Promise<AnalyticsOverview> {
    const range = this.resolveDateRange(query);

    const [
      currentRevenueAggregate,
      previousRevenueAggregate,
      currentOrdersCount,
      previousOrdersCount,
      currentPaidOrders,
      currentPendingOrders,
      currentCancelledOrders,
      totalCustomers,
      currentNewCustomers,
      previousNewCustomers,
      currentOrders,
      previousOrders,
      topItemsRaw,
      lowStockProducts,
      newCustomers,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: range.previousStart, lte: range.previousEnd },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: range.start, lte: range.end } },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.previousStart, lte: range.previousEnd },
        },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          paymentStatus: 'PAID',
        },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: range.start, lte: range.end },
          status: 'CANCELLED',
        },
      }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: range.start, lte: range.end },
        },
      }),
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: range.previousStart, lte: range.previousEnd },
        },
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: range.start, lte: range.end } },
        select: {
          createdAt: true,
          total: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: range.previousStart, lte: range.previousEnd },
        },
        select: {
          createdAt: true,
          total: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: range.start, lte: range.end },
            status: { not: 'CANCELLED' },
          },
        },
        select: {
          productId: true,
          productName: true,
          quantity: true,
          totalPrice: true,
          product: {
            select: {
              categoryId: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.getLowStockProducts(),
      this.prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const currentRevenue = Number(currentRevenueAggregate._sum.total || 0);
    const previousRevenue = Number(previousRevenueAggregate._sum.total || 0);

    const currentNonCancelledOrders = currentOrders.filter(
      (order) => order.status !== 'CANCELLED',
    );
    const previousNonCancelledOrders = previousOrders.filter(
      (order) => order.status !== 'CANCELLED',
    );

    const averageOrderValue =
      currentNonCancelledOrders.length > 0
        ? currentRevenue / currentNonCancelledOrders.length
        : 0;

    const previousAverageOrderValue =
      previousNonCancelledOrders.length > 0
        ? previousRevenue / previousNonCancelledOrders.length
        : 0;

    const kpis: KpiSummary = {
      totalRevenue: currentRevenue,
      totalOrders: currentOrdersCount,
      averageOrderValue,
      paidOrders: currentPaidOrders,
      pendingOrders: currentPendingOrders,
      totalCustomers,
      newCustomers: currentNewCustomers,
      cancellationRate:
        currentOrdersCount > 0
          ? (currentCancelledOrders / currentOrdersCount) * 100
          : 0,
      revenueChangePercent: this.calculatePercentChange(
        currentRevenue,
        previousRevenue,
      ),
      orderChangePercent: this.calculatePercentChange(
        currentOrdersCount,
        previousOrdersCount,
      ),
      customerGrowthPercent: this.calculatePercentChange(
        currentNewCustomers,
        previousNewCustomers,
      ),
      aovChangePercent: this.calculatePercentChange(
        averageOrderValue,
        previousAverageOrderValue,
      ),
    };

    const revenueTrend = this.buildRevenueTrend(
      currentNonCancelledOrders,
      range.start,
      range.end,
    );
    const previousRevenueTrend = this.buildRevenueTrend(
      previousNonCancelledOrders,
      range.previousStart,
      range.previousEnd,
    );

    return {
      range: {
        key: range.key,
        start: range.start.toISOString(),
        end: range.end.toISOString(),
        previousStart: range.previousStart.toISOString(),
        previousEnd: range.previousEnd.toISOString(),
      },
      kpis,
      revenueTrend,
      revenueComparisonTrend: this.buildComparisonTrend(
        revenueTrend,
        previousRevenueTrend,
      ),
      statusBreakdown: this.buildBreakdown(currentOrders, 'status'),
      paymentMethodBreakdown: this.buildBreakdown(
        currentOrders,
        'paymentMethod',
      ),
      paymentStatusBreakdown: this.buildBreakdown(
        currentOrders,
        'paymentStatus',
      ),
      hourlyPerformance: this.buildHourlyPerformance(currentNonCancelledOrders),
      weekdayPerformance: this.buildWeekdayPerformance(
        currentNonCancelledOrders,
      ),
      topProducts: this.buildTopProducts(topItemsRaw),
      topCategories: this.buildTopCategories(topItemsRaw),
      customerGrowthTrend: this.buildCustomerGrowthTrend(
        newCustomers,
        totalCustomers,
      ),
      orderValueDistribution: this.buildOrderValueDistribution(currentOrders),
      lowStockProducts,
    };
  }

  async getDashboardStats(query: AnalyticsQueryDto) {
    const overview = await this.getOverview(query);
    return {
      totalRevenue: overview.kpis.totalRevenue,
      revenueChange: this.formatSignedPercent(
        overview.kpis.revenueChangePercent,
      ),
      todayOrders: overview.kpis.totalOrders,
      todayOrdersChange: this.formatSignedPercent(
        overview.kpis.orderChangePercent,
      ),
      pendingOrders: overview.kpis.pendingOrders,
      totalCustomers: overview.kpis.totalCustomers,
      totalCustomersChange: this.formatSignedPercent(
        overview.kpis.customerGrowthPercent,
      ),
      recentOrders: [],
      topProducts: overview.topProducts,
    };
  }

  async getRevenueChart(query: AnalyticsQueryDto) {
    const overview = await this.getOverview(query);
    return overview.revenueTrend;
  }

  async getOrdersByStatus(query: AnalyticsQueryDto) {
    const overview = await this.getOverview(query);
    return overview.statusBreakdown.map((item) => ({
      status: item.label,
      _count: item.value,
    }));
  }

  async getLowStockProducts() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      include: {
        category: { select: { id: true, name: true } },
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { stock: 'asc' },
      take: 20,
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      category: product.category,
      image: product.images[0]?.url || null,
    }));
  }

  private resolveDateRange(query: AnalyticsQueryDto): DateRange {
    const now = new Date();

    if (query.from && query.to) {
      const parsedFrom = new Date(query.from);
      const parsedTo = new Date(query.to);

      const start = parsedFrom <= parsedTo ? parsedFrom : parsedTo;
      const end = parsedFrom <= parsedTo ? parsedTo : parsedFrom;

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const durationMs = end.getTime() - start.getTime();
      const previousEnd = new Date(start.getTime() - 1);
      const previousStart = new Date(previousEnd.getTime() - durationMs);

      return {
        key: 'custom',
        start,
        end,
        previousStart,
        previousEnd,
      };
    }

    const rangeKey = query.range || '30d';
    const dayMap: Record<AnalyticsRangeValue, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '365d': 365,
    };

    const days = dayMap[rangeKey];

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const durationMs = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - durationMs);

    return {
      key: rangeKey,
      start,
      end,
      previousStart,
      previousEnd,
    };
  }

  private buildRevenueTrend(
    orders: Array<{ createdAt: Date; total: unknown }>,
    start: Date,
    end: Date,
  ): RevenuePoint[] {
    const keys = this.buildDateKeys(start, end);
    const grouped = new Map<string, { revenue: number; orders: number }>();

    for (const key of keys) {
      grouped.set(key, { revenue: 0, orders: 0 });
    }

    orders.forEach((order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      const current = grouped.get(key);
      if (!current) return;

      current.revenue += Number(order.total || 0);
      current.orders += 1;
      grouped.set(key, current);
    });

    return keys.map((key) => {
      const point = grouped.get(key) || { revenue: 0, orders: 0 };
      return {
        date: key,
        revenue: point.revenue,
        orders: point.orders,
        aov: point.orders > 0 ? point.revenue / point.orders : 0,
      };
    });
  }

  private buildComparisonTrend(
    current: RevenuePoint[],
    previous: RevenuePoint[],
  ): ComparisonPoint[] {
    const size = Math.min(current.length, previous.length);

    return current.slice(-size).map((point, index) => {
      const previousPoint = previous[previous.length - size + index];
      return {
        date: point.date,
        currentRevenue: point.revenue,
        previousRevenue: previousPoint?.revenue || 0,
        currentOrders: point.orders,
        previousOrders: previousPoint?.orders || 0,
      };
    });
  }

  private buildBreakdown(
    orders: Array<Record<string, unknown>>,
    key: 'status' | 'paymentMethod' | 'paymentStatus',
  ): BreakdownPoint[] {
    const map = new Map<string, number>();

    orders.forEach((order) => {
      const rawValue = order[key];
      const value = typeof rawValue === 'string' ? rawValue : 'UNKNOWN';
      map.set(value, (map.get(value) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }

  private buildHourlyPerformance(
    orders: Array<{ createdAt: Date; total: unknown }>,
  ): HourlyPoint[] {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      revenue: 0,
      orders: 0,
    }));

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      buckets[hour].orders += 1;
      buckets[hour].revenue += Number(order.total || 0);
    });

    return buckets;
  }

  private buildWeekdayPerformance(
    orders: Array<{ createdAt: Date; total: unknown }>,
  ): WeekdayPoint[] {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets = labels.map((day) => ({ day, revenue: 0, orders: 0 }));

    orders.forEach((order) => {
      const index = order.createdAt.getDay();
      buckets[index].orders += 1;
      buckets[index].revenue += Number(order.total || 0);
    });

    return buckets;
  }

  private buildTopProducts(
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      totalPrice: unknown;
    }>,
  ): TopProductPoint[] {
    const map = new Map<string, TopProductPoint>();

    items.forEach((item) => {
      const current = map.get(item.productId) || {
        productId: item.productId,
        productName: item.productName,
        revenue: 0,
        quantity: 0,
      };

      current.revenue += Number(item.totalPrice || 0);
      current.quantity += item.quantity;
      map.set(item.productId, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private buildTopCategories(
    items: Array<{
      quantity: number;
      totalPrice: unknown;
      product: {
        categoryId: string;
        category: { id: string; name: string };
      };
    }>,
  ): TopCategoryPoint[] {
    const map = new Map<string, TopCategoryPoint>();

    items.forEach((item) => {
      const key = item.product.categoryId;
      const current = map.get(key) || {
        categoryId: item.product.category.id,
        categoryName: item.product.category.name,
        revenue: 0,
        quantity: 0,
      };

      current.revenue += Number(item.totalPrice || 0);
      current.quantity += item.quantity;
      map.set(key, current);
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }

  private buildCustomerGrowthTrend(
    users: Array<{ createdAt: Date }>,
    totalCustomers: number,
  ): CustomerGrowthPoint[] {
    const grouped = new Map<string, number>();

    users.forEach((user) => {
      const key = user.createdAt.toISOString().slice(0, 10);
      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    const keys = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
    let cumulative = totalCustomers - users.length;

    return keys.map((key) => {
      const newCustomers = grouped.get(key) || 0;
      cumulative += newCustomers;

      return {
        date: key,
        newCustomers,
        cumulativeCustomers: cumulative,
      };
    });
  }

  private buildOrderValueDistribution(
    orders: Array<{ total: unknown }>,
  ): OrderValueDistributionPoint[] {
    const buckets: Array<{ label: string; min: number; max: number | null }> = [
      { label: '0-499', min: 0, max: 499 },
      { label: '500-999', min: 500, max: 999 },
      { label: '1000-1999', min: 1000, max: 1999 },
      { label: '2000-4999', min: 2000, max: 4999 },
      { label: '5000+', min: 5000, max: null },
    ];

    const result = buckets.map((bucket) => ({
      bucket: bucket.label,
      count: 0,
    }));

    orders.forEach((order) => {
      const total = Number(order.total || 0);
      const index = buckets.findIndex((bucket) => {
        if (bucket.max === null) {
          return total >= bucket.min;
        }
        return total >= bucket.min && total <= bucket.max;
      });

      if (index >= 0) {
        result[index].count += 1;
      }
    });

    return result;
  }

  private buildDateKeys(start: Date, end: Date): string[] {
    const keys: string[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      keys.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }

    return keys;
  }

  private calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  }

  private formatSignedPercent(value: number): string {
    const rounded = Number(value.toFixed(1));
    if (rounded > 0) {
      return `+${rounded}%`;
    }
    return `${rounded}%`;
  }
}
