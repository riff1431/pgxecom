"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSettingPayload) => {
      const response = await instance.post<ApiResponse<Setting>>(
        "/admin/settings",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "public"] }),
      ]);
    },
  });
};

export const useUpdateAdminSetting = () => {
  const queryClient = useQueryClient();

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "public"] }),
      ]);
    },
  });
};

export const useDeleteAdminSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const response = await instance.delete<ApiResponse<{ message: string }>>(
        `/admin/settings/${key}`,
      );

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "public"] }),
      ]);
    },
  });
};

export const useBulkUpsertAdminSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkUpsertSettingsPayload) => {
      const response = await instance.post<ApiResponse<Setting[]>>(
        "/admin/settings/bulk-upsert",
        payload,
      );

      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "public"] }),
      ]);
    },
  });
};

export const useUploadAdminSettingImage = () => {
  const queryClient = useQueryClient();

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
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "public"] }),
      ]);
    },
  });
};

// ───────────────────────────────────────────────
// SMTP SETTINGS HOOKS
// ───────────────────────────────────────────────

export const useGetAdminSmtpSettings = () => {
  return useQuery({
    queryKey: ["admin", "settings", "smtp"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<import("@/types").SmtpSettings>>(
        "/admin/settings/smtp",
        {
          params: { _t: Date.now() },
        },
      );
      return response.data.data;
    },
    staleTime: 0,
  });
};

export const useUpdateAdminSmtpSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: import("@/types").UpdateSmtpSettingsPayload) => {
      const response = await instance.put<ApiResponse<import("@/types").SmtpSettings>>(
        "/admin/settings/smtp",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["admin", "settings", "smtp"] });
    },
  });
};

export const useTestAdminSmtpSettings = () => {
  return useMutation({
    mutationFn: async (payload: import("@/types").TestSmtpPayload) => {
      const response = await instance.post<ApiResponse<{ success: boolean; message: string }>>(
        "/admin/settings/smtp/test",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useImportSmtpFromEnv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await instance.post<ApiResponse<import("@/types").SmtpSettings>>(
        "/admin/settings/smtp/import-env",
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["admin", "settings", "smtp"] });
    },
  });
};

// ───────────────────────────────────────────────
// STRIPE PROFILES HOOKS
// ───────────────────────────────────────────────

export const useGetAdminStripeProfiles = () => {
  return useQuery({
    queryKey: ["admin", "settings", "stripe", "profiles"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<import("@/types").StripeProfilesResponse>>(
        "/admin/settings/stripe/profiles",
        {
          params: { _t: Date.now() },
        },
      );
      return response.data.data;
    },
    staleTime: 0,
  });
};

export const useCreateAdminStripeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: import("@/types").CreateStripeProfilePayload) => {
      const response = await instance.post<ApiResponse<import("@/types").StripeProfile>>(
        "/admin/settings/stripe/profiles",
        payload,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useUpdateAdminStripeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      data: import("@/types").UpdateStripeProfilePayload;
    }) => {
      const response = await instance.put<ApiResponse<import("@/types").StripeProfile>>(
        `/admin/settings/stripe/profiles/${params.id}`,
        params.data,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useActivateAdminStripeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.post<ApiResponse<import("@/types").StripeProfile>>(
        `/admin/settings/stripe/profiles/${id}/activate`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useDuplicateAdminStripeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.post<ApiResponse<import("@/types").StripeProfile>>(
        `/admin/settings/stripe/profiles/${id}/duplicate`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useDeleteAdminStripeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<{ message: string }>>(
        `/admin/settings/stripe/profiles/${id}`,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useVerifyAdminStripeConnection = () => {
  return useMutation({
    mutationFn: async (payload: import("@/types").VerifyStripePayload) => {
      const response = await instance.post<ApiResponse<import("@/types").VerifyStripeResponse>>(
        "/admin/settings/stripe/verify",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useImportStripeFromEnv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await instance.post<ApiResponse<import("@/types").StripeProfile>>(
        "/admin/settings/stripe/import-env",
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["admin", "settings", "stripe"] }),
        queryClient.refetchQueries({ queryKey: ["settings", "stripe"] }),
      ]);
    },
  });
};

export const useGetPublicStripeSettings = () => {
  return useQuery({
    queryKey: ["settings", "stripe", "public"],
    queryFn: async () => {
      const response = await instance.get<
        ApiResponse<{ publishableKey: string; currency: string; mode: string }>
      >("/settings/stripe-public");
      return response.data.data;
    },
  });
};
