"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api as instance } from "@/lib/api";
import type { User, ApiResponse } from "@/types";

export interface LoginResponse {
  user: User;
  token: string;
  supabaseToken?: string;
}

export const useGetMe = (enabled: boolean = false) => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<User>>("/auth/me");
      return response.data.data;
    },
    enabled,
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await instance.post<ApiResponse<LoginResponse>>("/auth/login", payload);
      return response.data.data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await instance.post<ApiResponse<LoginResponse>>("/auth/register", payload);
      return response.data.data;
    },
  });
};
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await instance.post<ApiResponse<any>>("/auth/forgot-password", payload);
      return response.data.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await instance.post<ApiResponse<any>>("/auth/reset-password", payload);
      return response.data.data;
    },
  });
};
