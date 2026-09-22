"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type {
  ApiResponse,
  BulkUpsertSettingsPayload,
  CreateSettingPayload,
  Setting,
  SettingQueryParams,
  UpdateSettingPayload,
} from "@/types";

const cleanParams = <T extends object>(params?: T): Partial<T> => {
  if (!params) return {};

  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    result[key as keyof T] = value as T[keyof T];
  }

  return result;
};

export const useGetAdminSettings = (params?: SettingQueryParams) => {
  const cleanedParams = cleanParams(params);

  return useQuery({
    queryKey: ["admin", "settings", cleanedParams],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Setting[]>>(
        "/admin/settings",
        {
          params: cleanedParams,
        },
      );

      return response.data.data;
    },
  });
};

export const useGetPublicSettings = () => {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Setting[]>>("/settings");
      return response.data.data;
    },
  });
};

export const useCreateAdminSetting = () => {
  return useMutation({
    mutationFn: async (payload: CreateSettingPayload) => {
      const response = await instance.post<ApiResponse<Setting>>(
        "/admin/settings",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useUpdateAdminSetting = () => {
  return useMutation({
    mutationFn: async (payload: {
      key: string;
      data: UpdateSettingPayload;
    }) => {
      const response = await instance.put<ApiResponse<Setting>>(
        `/admin/settings/${payload.key}`,
        payload.data,
      );

      return response.data.data;
    },
  });
};

export const useDeleteAdminSetting = () => {
  return useMutation({
    mutationFn: async (key: string) => {
      const response = await instance.delete<ApiResponse<{ message: string }>>(
        `/admin/settings/${key}`,
      );

      return response.data.data;
    },
  });
};

export const useBulkUpsertAdminSettings = () => {
  return useMutation({
    mutationFn: async (payload: BulkUpsertSettingsPayload) => {
      const response = await instance.post<ApiResponse<Setting[]>>(
        "/admin/settings/bulk-upsert",
        payload,
      );

      return response.data.data;
    },
  });
};

export const useUploadAdminSettingImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await instance.post<ApiResponse<{ url: string }>>(
        "/admin/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      return response.data.data;
    },
  });
};
