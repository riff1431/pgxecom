import {
  CalendarDays,
  DollarSign,
  PackageCheck,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsOverview } from "@/types";

import { formatCurrency, formatPercent } from "./analytics-config";

export function AnalyticsKpiGrid({
  overview,
}: {
  overview?: AnalyticsOverview;
}) {
  const topKpis = overview?.kpis;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        title="Revenue"
        value={formatCurrency(topKpis?.totalRevenue || 0)}
        subtitle="Non-cancelled orders"
        change={formatPercent(topKpis?.revenueChangePercent || 0)}
        icon={DollarSign}
      />
      <KpiCard
        title="Orders"
        value={(topKpis?.totalOrders || 0).toLocaleString()}
        subtitle="All orders"
        change={formatPercent(topKpis?.orderChangePercent || 0)}
        icon={ShoppingCart}
      />
      <KpiCard
        title="AOV"
        value={formatCurrency(topKpis?.averageOrderValue || 0)}
        subtitle="Average order value"
        change={formatPercent(topKpis?.aovChangePercent || 0)}
        icon={Receipt}
      />
      <KpiCard
        title="New Customers"
        value={(topKpis?.newCustomers || 0).toLocaleString()}
        subtitle={`Total customers ${topKpis?.totalCustomers || 0}`}
        change={formatPercent(topKpis?.customerGrowthPercent || 0)}
        icon={Users}
      />
      <KpiCard
        title="Paid Orders"
        value={(topKpis?.paidOrders || 0).toLocaleString()}
        subtitle="Payment success count"
        change=""
        icon={PackageCheck}
      />
      <KpiCard
        title="Pending Orders"
        value={(topKpis?.pendingOrders || 0).toLocaleString()}
        subtitle="Requires action"
        change=""
        icon={CalendarDays}
      />
      <KpiCard
        title="Cancellation Rate"
        value={`${(topKpis?.cancellationRate || 0).toFixed(1)}%`}
        subtitle="Within selected range"
        change=""
        icon={RefreshCw}
      />
      <KpiCard
        title="Range"
        value={overview?.range.key || "-"}
        subtitle={`${overview?.range.start.slice(0, 10) || "-"} to ${overview?.range.end.slice(0, 10) || "-"}`}
        change=""
        icon={CalendarDays}
      />
    </section>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="rounded-2xl border-slate-800 bg-[#0b1322] text-slate-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              {title}
            </p>
            <p className="text-2xl font-black font-mono text-white mt-1">{value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00a3ff]">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {change ? (
          <p className="text-xs font-mono font-bold text-emerald-400 mt-3">
            {change}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
