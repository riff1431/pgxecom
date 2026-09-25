"use client";

import {
  useGetAdminOrders,
  useGetDashboardStats,
  useGetLowStockProducts,
} from "@/lib/api/admin";
import { useState } from "react";
import { RecentOrdersTable } from "./components/RecentOrdersTable";
import { SidebarActions } from "./components/SidebarActions";
import { StatsCards } from "./components/StatsCards";

export default function AdminDashboardPage() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: lowStock, isLoading: lowStockLoading } =
    useGetLowStockProducts();
  const { data: ordersData, isLoading: ordersLoading } = useGetAdminOrders({
    page,
    limit,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-mono uppercase">
            Executive Summary
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1 font-mono">
            Real-time business performance & operations
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <StatsCards stats={stats} />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrdersTable
            orders={ordersData?.data || []}
            isLoading={ordersLoading}
            currentPage={page}
            totalPages={ordersData?.meta?.totalPage || 1}
            onPageChange={setPage}
          />
        </div>

        {/* Sidebar Actions (Low Stock + Quick Links) */}
        <div>
          <SidebarActions lowStockProducts={lowStock} />
        </div>
      </div>
    </div>
  );
}
