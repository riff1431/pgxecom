import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order } from "@/types";

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await api.post("/orders", orderData);
      return data.data as Order;
    },
  });
}

export function useTrackOrder(orderNumber: string, phone: string) {
  return useQuery({
    queryKey: ["track-order", orderNumber, phone],
    queryFn: async () => {
      const { data } = await api.get(`/orders/track/${orderNumber}`, {
        params: { phone },
      });
      return data.data as Order;
    },
    enabled: !!orderNumber && !!phone,
  });
}

export function useMyOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ["my-orders", params],
    queryFn: async () => {
      const { data } = await api.get("/users/orders", { params });
      return data.data;
    },
  });
}

export function useAdminOrders(params?: { page?: number; limit?: number; status?: string; search?: string }) {
  return useQuery({
    queryKey: ["admin-orders", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/orders", { params });
      return data.data;
    },
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/orders/${id}`);
      return data.data as Order;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status, note });
      return data.data;
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
      const { data } = await api.post("/coupons/validate", { code, subtotal });
      return data.data;
    },
  });
}

export function useShippingZones() {
  return useQuery({
    queryKey: ["shipping-zones"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/shipping-zones");
        return data.data;
      } catch (e) {
        return [
          { id: "inside_dhaka", name: "Inside Dhaka", rate: 60, estimatedDays: "1-2" },
          { id: "outside_dhaka", name: "Outside Dhaka", rate: 120, estimatedDays: "3-5" },
        ];
      }
    },
  });
}
