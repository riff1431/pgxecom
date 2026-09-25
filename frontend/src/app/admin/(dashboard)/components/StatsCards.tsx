"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ShoppingCart, Clock, Users } from "lucide-react";
import { CURRENCY } from "@/lib/constants";
import { DashboardStats } from "@/lib/api/admin";

interface StatsCardsProps {
  stats?: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      title: "Total Revenue",
      value: `${CURRENCY}${stats?.totalRevenue.toLocaleString() || "0"}`,
      icon: DollarSign,
      change: stats?.revenueChange || "+0%",
      color: "emerald",
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: ShoppingCart,
      change: stats?.todayOrdersChange || "+0",
      color: "blue",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      change: "Action needed",
      color: "amber",
    },
    {
      title: "Total Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      change: stats?.totalCustomersChange || "+0",
      color: "violet",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => (
        <Card
          key={stat.title}
          className="border-border bg-card shadow-xs hover:shadow-sm hover:border-primary/40 transition-all text-card-foreground"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <Badge
                variant="secondary"
                className="text-xs font-mono font-semibold bg-muted text-muted-foreground border border-border"
              >
                {stat.change}
              </Badge>
            </div>
            <p className="text-2xl font-black text-foreground font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase font-mono tracking-wider font-semibold">
              {stat.title}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
