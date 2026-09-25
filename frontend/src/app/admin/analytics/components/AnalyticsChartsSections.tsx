import Image from "next/image";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveImageUrl } from "@/lib/utils";
import type { AnalyticsOverview } from "@/types";

import { CHART_COLORS } from "./analytics-config";

export function AnalyticsChartsSections({
  overview,
}: {
  overview?: AnalyticsOverview;
}) {
  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Revenue & Orders Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-88">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overview?.revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#00a3ff22"
                  stroke="#00a3ff"
                  name="Revenue"
                />
                <Bar
                  yAxisId="right"
                  dataKey="orders"
                  fill="#0ea5e9"
                  name="Orders"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="aov"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="AOV"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Current vs Previous Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-88">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.revenueComparisonTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="currentRevenue"
                  fill="#00a3ff"
                  name="Current"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="previousRevenue"
                  fill="#94a3b8"
                  name="Previous"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <PieCard
          title="Order Status Split"
          data={overview?.statusBreakdown || []}
        />
        <PieCard
          title="Payment Method Split"
          data={overview?.paymentMethodBreakdown || []}
        />
        <PieCard
          title="Payment Status Split"
          data={overview?.paymentStatusBreakdown || []}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Weekday Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.weekdayPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="orders"
                  fill="#0ea5e9"
                  name="Orders"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#00a3ff"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Hourly Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview?.hourlyPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#8b5cf6"
                  fill="#8b5cf622"
                  name="Orders"
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00a3ff"
                  fill="#00a3ff22"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Top Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview?.topProducts || []}
                layout="vertical"
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={130}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="revenue" fill="#00a3ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Top Categories by Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.topCategories || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="categoryName" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Customer Growth Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overview?.customerGrowthTrend || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="newCustomers"
                  fill="#6366f1"
                  name="New"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeCustomers"
                  stroke="#00a3ff"
                  name="Cumulative"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
          <CardHeader className="border-b border-border">
            <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Order Value Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.orderValueDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="bucket" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
        <CardHeader className="border-b border-border">
          <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {overview?.lowStockProducts.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2.5">Product</th>
                    <th className="py-2.5">Category</th>
                    <th className="py-2.5">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.lowStockProducts.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          {item.image ? (
                            <Image
                              width={32}
                              height={32}
                              src={resolveImageUrl(item.image)}
                              alt={item.name}
                              className="h-8 w-8 rounded object-cover"
                              unoptimized
                            />
                          ) : null}
                          <span className="font-bold text-foreground">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-muted-foreground font-mono text-xs">
                        {item.category?.name || "-"}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex rounded-md bg-destructive/10 border border-destructive/20 px-2 py-0.5 text-[11px] font-mono font-bold text-destructive">
                          {item.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-mono py-4">
              No low stock products in alert threshold.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function PieCard({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
}) {
  return (
    <Card className="rounded-xl border-border bg-card text-card-foreground shadow-xs">
      <CardHeader className="border-b border-border">
        <CardTitle className="font-mono text-sm uppercase tracking-wider font-bold text-card-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-80 pt-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground font-mono py-6">No data in selected period.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={96}
                label
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
