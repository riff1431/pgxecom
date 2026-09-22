"use client";

import { api as instance } from "@/lib/api";
import type {
  AdminCustomer,
  AdminCustomerDetails,
  ApiResponse,
  Order,
  User,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

interface MessageResponse {
  message: string;
}

interface Address {
  id: string;
  label?: string;
  name: string;
  phone: string;
  street: string;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city: string;
  zone?: string;
  isDefault: boolean;
}

interface AddressPayload {
  label?: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  area?: string;
  zone?: string;
  isDefault?: boolean;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (payload: { name?: string; avatar?: string }) => {
      const response = await instance.put<ApiResponse<User>>(
        "/users/profile",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useRequestEmailChange = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await instance.post<ApiResponse<MessageResponse>>(
        "/users/email-change/request",
        { email },
      );
      return response.data.data;
    },
  });
};

export const useVerifyEmailChange = () => {
  return useMutation({
    mutationFn: async (otp: string) => {
      const response = await instance.post<ApiResponse<User>>(
        "/users/email-change/verify",
        { otp },
      );
      return response.data.data;
    },
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await instance.post<ApiResponse<{ url: string }>>(
        "/users/upload/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data.data;
    },
  });
};

export const useGetAddresses = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["addresses"],
    enabled,
    queryFn: async () => {
      const response =
        await instance.get<ApiResponse<Address[]>>("/users/addresses");
      return response.data.data;
    },
  });
};

export const useCreateAddress = () => {
  return useMutation({
    mutationFn: async (data: AddressPayload) => {
      const response = await instance.post<ApiResponse<Address>>(
        "/users/addresses",
        data,
      );
      return response.data.data;
    },
  });
};

export const useUpdateAddress = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddressPayload }) => {
      const response = await instance.put<ApiResponse<Address>>(
        `/users/addresses/${id}`,
        data,
      );
      return response.data.data;
    },
  });
};

export const useDeleteAddress = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<MessageResponse>>(
        `/users/addresses/${id}`,
      );
      return response.data.data;
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordPayload) => {
      const response = await instance.post<ApiResponse<MessageResponse>>(
        "/users/password/change",
        data,
      );
      return response.data.data;
    },
  });
};

// Admin customer hooks

export interface AdminCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "banned";
}

export interface AdminCustomerOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
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

export const useGetAdminCustomers = (params?: AdminCustomersParams) => {
  const cleanedParams = cleanParams(params);

  return useQuery({
    queryKey: ["admin", "customers", cleanedParams],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<AdminCustomer[]>>(
        "/admin/customers",
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

export const useGetAdminCustomerDetails = (
  id: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["admin", "customers", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      const response = await instance.get<ApiResponse<AdminCustomerDetails>>(
        `/admin/customers/${id}`,
      );
      return response.data.data;
    },
  });
};

export const useGetAdminCustomerOrders = (
  customerId: string,
  params?: AdminCustomerOrdersParams,
  enabled: boolean = true,
) => {
  const cleanedParams = cleanParams(params);

  return useQuery({
    queryKey: ["admin", "customers", customerId, "orders", cleanedParams],
    enabled: enabled && !!customerId,
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Order[]>>(
        `/admin/customers/${customerId}/orders`,
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

export const useBanAdminCustomer = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; reason?: string }) => {
      const response = await instance.put<ApiResponse<{ isBanned: boolean }>>(
        `/admin/customers/${payload.id}/ban`,
        {
          reason: payload.reason,
        },
      );

      return response.data.data;
    },
  });
};

export const useUnbanAdminCustomer = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.put<ApiResponse<{ isBanned: boolean }>>(
        `/admin/customers/${id}/unban`,
      );

      return response.data.data;
    },
  });
};

export const useMailAdminCustomer = () => {
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      subject: string;
      message: string;
    }) => {
      const response = await instance.post<ApiResponse<{ message: string }>>(
        `/admin/customers/${payload.id}/mail`,
        {
          subject: payload.subject,
          message: payload.message,
        },
      );

      return response.data.data;
    },
  });
};
