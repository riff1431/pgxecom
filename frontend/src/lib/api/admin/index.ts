"use client";

import { useQuery } from "@tanstack/react-query";
import { api as instance } from "@/lib/api";
import type { Order, ApiResponse, PaginatedResponse } from "@/types";

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: string;
  todayOrders: number;
  todayOrdersChange: string;
  pendingOrders: number;
  totalCustomers: number;
  totalCustomersChange: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
}

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<DashboardStats>>("/admin/analytics/dashboard");
      return response.data.data;
    },
  });
};

export const useGetLowStockProducts = () => {
  return useQuery({
    queryKey: ["admin", "low-stock"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<LowStockProduct[]>>("/admin/analytics/low-stock");
      return response.data.data;
    },
  });
};

export const useGetAdminOrders = (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Order[]>>("/admin/orders", {
        params,
      });
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    },
  });
};
