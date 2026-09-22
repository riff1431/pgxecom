import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category, Banner, ShippingZone } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data.data as Category[];
    },
  });
}

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await api.get("/banners");
      return data.data as Banner[];
    },
  });
}

export function useShippingZones() {
  return useQuery({
    queryKey: ["shipping-zones"],
    queryFn: async () => {
      const { data } = await api.get("/shipping-zones");
      return data.data as ShippingZone[];
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics/dashboard");
      return data.data;
    },
  });
}

export function useRevenueChart(days: number = 30) {
  return useQuery({
    queryKey: ["admin-revenue", days],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics/revenue", { params: { days } });
      return data.data;
    },
  });
}

export function useBlogPosts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["blog-posts", params],
    queryFn: async () => {
      const { data } = await api.get("/blog", { params });
      return data.data;
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blog/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
}
