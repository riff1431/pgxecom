"use client";

import { useQuery } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type {
  AnalyticsOverview,
  AnalyticsOverviewParams,
  ApiResponse,
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

export const useGetAdminAnalyticsOverview = (
  params?: AnalyticsOverviewParams,
) => {
  const cleanedParams = cleanParams(params);

  return useQuery({
    queryKey: ["admin", "analytics", "overview", cleanedParams],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<AnalyticsOverview>>(
        "/admin/analytics/overview",
        {
          params: cleanedParams,
        },
      );

      return response.data.data;
    },
  });
};
