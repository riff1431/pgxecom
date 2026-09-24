"use client";

import { api as instance } from "@/lib/api";
import type { ApiResponse, Order } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface CreateOrderPayload {
  userId?: string;
  addressId?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  shippingAddress: {
    name?: string;
    phone?: string;
    street: string;
    addressLine2?: string;
    area?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
    zone: string;
  };
  zone: string;
  notes?: string;
  paymentMethod: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price?: number;
  }[];
  couponCode?: string;
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await instance.post<ApiResponse<Order>>(
        "/orders",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useGetMyOrders = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["orders", "me", params],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Order[]>>("/orders/me", {
        params,
      });
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    },
  });
};

export const useGetMyOrderDetails = (id: string) => {
  return useQuery({
    queryKey: ["orders", "me", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await instance.get<ApiResponse<Order>>(
        `/orders/me/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async (payload: { code: string; subtotal: number }) => {
      const response = await instance.post<
        ApiResponse<{ discountAmount: number; coupon: any }>
      >("/coupons/validate", payload);
      return response.data.data;
    },
  });
};
export const useTrackOrder = (orderNumber: string, phone: string) => {
  return useQuery({
    queryKey: ["orders", "track", orderNumber, phone],
    queryFn: async () => {
      if (!orderNumber || !phone) return null;
      const response = await instance.get<ApiResponse<Order>>(
        `/orders/track/${orderNumber}`,
        {
          params: { phone },
        },
      );
      return response.data.data;
    },
    enabled: !!orderNumber && !!phone,
  });
};

// Admin order hooks

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

const cleanParams = <T extends object>(params?: T): Partial<T> => {
  if (!params) return {};
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(
    params as Record<string, unknown>,
  )) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    result[key as keyof T] = value as T[keyof T];
  }
  return result;
};

export const useGetAdminOrders = (params?: AdminOrdersParams) => {
  const cleanedParams = cleanParams(params);
  return useQuery({
    queryKey: ["admin", "orders", cleanedParams],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Order[]>>(
        "/admin/orders",
        {
          params: cleanedParams,
        },
      );
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    },
  });
};

export const useGetAdminOrderDetails = (
  id: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["admin", "orders", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Order>>(
        `/admin/orders/${id}`,
      );
      return response.data.data;
    },
  });
};

export const useUpdateOrderStatus = () => {
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      status: string;
      note?: string;
    }) => {
      const response = await instance.put<ApiResponse<Order>>(
        `/admin/orders/${payload.id}/status`,
        {
          status: payload.status,
          note: payload.note,
        },
      );
      return response.data.data;
    },
  });
};

export const useGetInvoiceDetails = (
  id: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["admin", "orders", id, "invoice"],
    enabled: enabled && !!id,
    queryFn: async () => {
      const response = await instance.get<ApiResponse<any>>(
        `/admin/orders/${id}/invoice`,
      );
      return response.data.data;
    },
  });
};
