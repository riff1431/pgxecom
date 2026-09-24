"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type {
  AdminCoupon,
  ApiResponse,
  CouponUpsertPayload,
  CouponValidationResult,
} from "@/types";

export interface AdminCouponsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}

const cleanParams = <T extends object>(params?: T): Partial<T> => {
  if (!params) return {};

  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (value === "all") continue;

    result[key as keyof T] = value as T[keyof T];
  }

  return result;
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async (payload: { code: string; subtotal: number }) => {
      const response = await instance.post<ApiResponse<CouponValidationResult>>(
        "/coupons/validate",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useGetAdminCoupons = (params?: AdminCouponsParams) => {
  const cleanedParams = cleanParams(params);

  return useQuery({
    queryKey: ["admin", "coupons", cleanedParams],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<AdminCoupon[]>>(
        "/admin/coupons",
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

export const useCreateAdminCoupon = () => {
  return useMutation({
    mutationFn: async (payload: CouponUpsertPayload) => {
      const response = await instance.post<ApiResponse<AdminCoupon>>(
        "/admin/coupons",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useUpdateAdminCoupon = () => {
  return useMutation({
    mutationFn: async (payload: CouponUpsertPayload) => {
      if (!payload.id) {
        throw new Error("Coupon id is required");
      }

      const { id, ...data } = payload;

      const response = await instance.put<ApiResponse<AdminCoupon>>(
        `/admin/coupons/${id}`,
        data,
      );
      return response.data.data;
    },
  });
};

export const useToggleAdminCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; isActive: boolean }) => {
      const response = await instance.put<ApiResponse<AdminCoupon>>(
        `/admin/coupons/${payload.id}/status`,
        {
          isActive: payload.isActive,
        },
      );
      return response.data.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "coupons"] });
      queryClient.setQueriesData({ queryKey: ["admin", "coupons"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((c: AdminCoupon) =>
              c.id === payload.id ? { ...c, isActive: payload.isActive } : c,
            ),
          };
        }
        return oldData;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
};

export const useDeleteAdminCoupon = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<{ message: string }>>(
        `/admin/coupons/${id}`,
      );
      return response.data.data;
    },
  });
};
