"use client";

import { api as instance } from "@/lib/api";
import type {
  ApiResponse,
  CreateShippingZonePayload,
  ShippingZone,
  UpdateShippingZonePayload,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetShippingZones = () => {
  return useQuery({
    queryKey: ["shipping-zones"],
    queryFn: async () => {
      const response =
        await instance.get<ApiResponse<ShippingZone[]>>("/shipping-zones");
      return response.data.data;
    },
  });
};

export const useGetActiveShippingZones = () => {
  return useQuery({
    queryKey: ["shipping-zones", "active"],
    queryFn: async () => {
      const response =
        await instance.get<ApiResponse<ShippingZone[]>>("/shipping-zones");
      return response.data.data.filter((zone) => zone.isActive);
    },
  });
};

export const useGetAdminShippingZones = () => {
  return useQuery({
    queryKey: ["admin", "shipping-zones"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<ShippingZone[]>>(
        "/admin/shipping-zones",
      );

      return response.data.data;
    },
  });
};

export const useCreateAdminShippingZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateShippingZonePayload) => {
      const response = await instance.post<ApiResponse<ShippingZone>>(
        "/admin/shipping-zones",
        payload,
      );

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
    },
  });
};

export const useUpdateAdminShippingZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateShippingZonePayload;
    }) => {
      const response = await instance.put<ApiResponse<ShippingZone>>(
        `/admin/shipping-zones/${id}`,
        data,
      );

      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "shipping-zones", variables.id],
      });
    },
  });
};

export const useToggleAdminShippingZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await instance.patch<ApiResponse<ShippingZone>>(
        `/admin/shipping-zones/${id}/toggle`,
        { isActive },
      );

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
    },
  });
};

export const useDeleteAdminShippingZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<ShippingZone>>(
        `/admin/shipping-zones/${id}`,
      );

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      queryClient.invalidateQueries({ queryKey: ["shipping-zones"] });
    },
  });
};
