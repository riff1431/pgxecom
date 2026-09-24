"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { api as instance } from "@/lib/api";
import type { Product, ApiResponse } from "@/types";

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  hot?: boolean;
}

const cleanParams = <T extends Record<string, any>>(params?: T): Partial<T> => {
  if (!params) return {};
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    result[key as keyof T] = value;
  }
  return result;
};

export const useGetProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Product[]>>("/products", {
        params: cleanParams(params),
      });
      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    },
    placeholderData: keepPreviousData,
  });
};

export const useGetProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Product>>(`/products/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });
};

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Product[]>>("/products/featured");
      return response.data.data;
    },
  });
};

export const useGetAdminProduct = (id: string) => {
  return useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Product>>(`/admin/products/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export interface ProductAdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const useGetAdminProducts = (params?: ProductAdminQueryParams) => {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Product[]>>("/admin/products", {
        params: cleanParams(params),
      });

      const resData = response.data as any;

      return {
        data: (resData.data as Product[]) || [],
        meta: {
          total: resData.meta?.total || 0,
          page: resData.meta?.page || 1,
          limit: resData.meta?.limit || 10,
          totalPage: resData.meta?.totalPage || 1,
        },
      };
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await instance.post<ApiResponse<Product>>("/admin/products", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await instance.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ["product", data.slug] });
      }
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<any>>(`/admin/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useToggleProductActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.patch<ApiResponse<Product>>(`/admin/products/${id}/toggle`);
      return response.data.data;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["admin-products"] });

      // Optimistically flip isActive in all admin-products queries
      queryClient.setQueriesData({ queryKey: ["admin-products"] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.map((prod: Product) =>
              prod.id === id ? { ...prod, isActive: !prod.isActive } : prod,
            ),
          };
        }
        return oldData;
      });
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ["product", data.slug] });
      }
    },
  });
};
