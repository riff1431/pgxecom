"use client";

import { api as instance } from "@/lib/api";
import type {
  ApiResponse,
  Category,
  CategoryCascaderOption,
  CategoryMutationInput,
  CategoryTreeNode,
  PaginatedResponse,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const cleanParams = <T extends Record<string, unknown>>(
  params?: T,
): Partial<T> => {
  if (!params) return {};

  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    result[key as keyof T] = value as T[keyof T];
  }

  return result;
};

const mapTreeToCascaderOptions = (
  nodes: CategoryTreeNode[],
): CategoryCascaderOption[] => {
  return nodes.map((node) => ({
    value: node.id,
    label: node.name,
    textLabel: node.name,
    children:
      node.children.length > 0
        ? mapTreeToCascaderOptions(node.children)
        : undefined,
  }));
};

const collectDescendantIds = (node: CategoryTreeNode): Set<string> => {
  const ids = new Set<string>([node.id]);

  for (const child of node.children) {
    const childIds = collectDescendantIds(child);
    for (const childId of childIds) {
      ids.add(childId);
    }
  }

  return ids;
};

const excludeNodeAndDescendants = (
  nodes: CategoryTreeNode[],
  excludedNodeId?: string,
): CategoryTreeNode[] => {
  if (!excludedNodeId) {
    return nodes;
  }

  let blockedIds = new Set<string>();

  const locate = (items: CategoryTreeNode[]): void => {
    for (const item of items) {
      if (item.id === excludedNodeId) {
        blockedIds = collectDescendantIds(item);
        return;
      }
      locate(item.children);
      if (blockedIds.size > 0) {
        return;
      }
    }
  };

  locate(nodes);

  const prune = (items: CategoryTreeNode[]): CategoryTreeNode[] => {
    return items
      .filter((item) => !blockedIds.has(item.id))
      .map((item) => ({
        ...item,
        children: prune(item.children),
      }));
  };

  return prune(nodes);
};

export const findCategoryPathById = (
  nodes: CategoryTreeNode[],
  targetId: string,
): string[] => {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [node.id];
    }

    const childPath = findCategoryPathById(node.children, targetId);
    if (childPath.length > 0) {
      return [node.id, ...childPath];
    }
  }

  return [];
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response =
        await instance.get<ApiResponse<PaginatedResponse<Category>>>(
          "/categories",
        );
      return response.data.data.data;
    },
  });
};

export const useGetCategory = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await instance.get<ApiResponse<Category>>(
        `/categories/${slug}`,
      );
      return response.data.data;
    },
    enabled: !!slug,
  });
};

export const useGetAdminCategories = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["admin-categories", params],
    queryFn: async () => {
      const response = await instance.get<
        ApiResponse<PaginatedResponse<Category>>
      >("/admin/categories", {
        params: cleanParams(params),
      });

      const payload = response.data.data;
      return {
        data: payload.data,
        meta: payload.meta,
      };
    },
  });
};

export const useCategoryTree = (params?: {
  admin?: boolean;
  excludeId?: string;
}) => {
  return useQuery({
    queryKey: ["category-tree", params],
    queryFn: async () => {
      const endpoint = params?.admin
        ? "/admin/categories/tree"
        : "/categories/tree";
      const response =
        await instance.get<ApiResponse<CategoryTreeNode[]>>(endpoint);
      const rawTree = response.data.data;
      const tree = excludeNodeAndDescendants(rawTree, params?.excludeId);

      return {
        tree,
        options: mapTreeToCascaderOptions(tree),
      };
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CategoryMutationInput) => {
      const response = await instance.post<ApiResponse<Category>>(
        "/admin/categories",
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CategoryMutationInput>;
    }) => {
      const response = await instance.put<ApiResponse<Category>>(
        `/admin/categories/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: ["category", data.slug] });
      }
      // Also invalidate products because they might show category names
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await instance.delete<ApiResponse<null>>(
        `/admin/categories/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category-tree"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
