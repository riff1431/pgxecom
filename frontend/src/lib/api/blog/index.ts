"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api as instance } from "@/lib/api";
import type {
  ApiResponse,
  BlogPost,
  BlogQueryParams,
  BlogUpsertPayload,
} from "@/types";

interface BlogListApiData {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const normalizeBlogListResponse = (
  response: ApiResponse<BlogListApiData | BlogPost[]>,
) => {
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
      meta: response.meta,
    };
  }

  return {
    data: response.data.posts,
    meta: {
      page: response.data.pagination.page,
      totalPage: response.data.pagination.totalPages,
      total: response.data.pagination.total,
      limit: response.data.pagination.limit,
    },
  };
};

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

export const useGetBlogPosts = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ["blog-posts", params],
    queryFn: async () => {
      const response = await instance.get<
        ApiResponse<BlogListApiData | BlogPost[]>
      >("/blog", {
        params: cleanParams(params),
      });

      return normalizeBlogListResponse(response.data);
    },
  });
};

export const useGetBlogPost = (slug: string) => {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<BlogPost>>(
        `/blog/details/${slug}`,
      );
      return response.data.data;
    },
    enabled: !!slug,
  });
};

export const useGetAdminBlogPosts = (params?: BlogQueryParams) => {
  return useQuery({
    queryKey: ["admin", "blog", params],
    queryFn: async () => {
      const response = await instance.get<
        ApiResponse<BlogListApiData | BlogPost[]>
      >("/admin/blog", {
        params: cleanParams(params),
      });

      return normalizeBlogListResponse(response.data);
    },
  });
};

export const useCreateAdminBlogPost = () => {
  return useMutation({
    mutationFn: async (payload: BlogUpsertPayload) => {
      const response = await instance.post<ApiResponse<BlogPost>>(
        "/admin/blog",
        payload,
      );
      return response.data.data;
    },
  });
};

export const useUpdateAdminBlogPost = () => {
  return useMutation({
    mutationFn: async (payload: BlogUpsertPayload) => {
      if (!payload.id) {
        throw new Error("Blog id is required");
      }

      const { id, ...data } = payload;
      const response = await instance.put<ApiResponse<BlogPost>>(
        `/admin/blog/${id}`,
        data,
      );
      return response.data.data;
    },
  });
};

export const useToggleAdminBlogStatus = () => {
  return useMutation({
    mutationFn: async (payload: { id: string; isPublished: boolean }) => {
      const response = await instance.put<ApiResponse<BlogPost>>(
        `/admin/blog/${payload.id}/status`,
        { isPublished: payload.isPublished },
      );

      return response.data.data;
    },
  });
};

export const useDeleteAdminBlogPost = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<{ message: string }>>(
        `/admin/blog/${id}`,
      );

      return response.data.data;
    },
  });
};

export const useUploadAdminBlogImage = () => {
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
