import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types";

// ─── Public Product Queries ─────────────────────

export function useProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  hot?: boolean;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get("/products", { params });
      return data.data;
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data as Product;
    },
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const { data } = await api.get("/products/featured");
      return data.data as Product[];
    },
  });
}

// ─── Admin Product Mutations ────────────────────

export function useCreateProduct() {
  return useMutation({
    mutationFn: async (productData: any) => {
      const { data } = await api.post("/admin/products", productData);
      return data.data;
    },
  });
}

export function useUpdateProduct() {
  return useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      const { data } = await api.put(`/admin/products/${id}`, productData);
      return data.data;
    },
  });
}

export function useDeleteProduct() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/products/${id}`);
    },
  });
}
