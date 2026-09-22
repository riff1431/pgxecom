export type AnalyticsRangeKey =
  | "7d"
  | "30d"
  | "90d"
  | "180d"
  | "365d"
  | "custom";

export interface AnalyticsKpiSummary {
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

export interface AnalyticsRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface AnalyticsComparisonPoint {
  date: string;
  currentRevenue: number;
  previousRevenue: number;
  currentOrders: number;
  previousOrders: number;
}

export interface AnalyticsBreakdownPoint {
  label: string;
  value: number;
}

export interface AnalyticsHourlyPoint {
  hour: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsWeekdayPoint {
  day: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsTopProductPoint {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
}

export interface AnalyticsTopCategoryPoint {
  categoryId: string;
  categoryName: string;
  revenue: number;
  quantity: number;
}

export interface AnalyticsCustomerGrowthPoint {
  date: string;
  newCustomers: number;
  cumulativeCustomers: number;
}

export interface AnalyticsOrderValueDistributionPoint {
  bucket: string;
  count: number;
}

export interface AnalyticsLowStockProduct {
  id: string;
  name: string;
  stock: number;
  category?: {
    id: string;
    name: string;
  } | null;
  image?: string | null;
}

export interface AnalyticsOverview {
  range: {
    key: AnalyticsRangeKey;
    start: string;
    end: string;
    previousStart: string;
    previousEnd: string;
  };
  kpis: AnalyticsKpiSummary;
  revenueTrend: AnalyticsRevenuePoint[];
  revenueComparisonTrend: AnalyticsComparisonPoint[];
  statusBreakdown: AnalyticsBreakdownPoint[];
  paymentMethodBreakdown: AnalyticsBreakdownPoint[];
  paymentStatusBreakdown: AnalyticsBreakdownPoint[];
  hourlyPerformance: AnalyticsHourlyPoint[];
  weekdayPerformance: AnalyticsWeekdayPoint[];
  topProducts: AnalyticsTopProductPoint[];
  topCategories: AnalyticsTopCategoryPoint[];
  customerGrowthTrend: AnalyticsCustomerGrowthPoint[];
  orderValueDistribution: AnalyticsOrderValueDistributionPoint[];
  lowStockProducts: AnalyticsLowStockProduct[];
}

export interface AnalyticsOverviewParams {
  range?: Exclude<AnalyticsRangeKey, "custom">;
  from?: string;
  to?: string;
}
