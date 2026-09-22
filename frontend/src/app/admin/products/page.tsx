"use client";

import { AdminDeleteDialog } from "@/components/admin/AdminDeleteDialog";
import { AppPagination } from "@/components/shared/AppPagination";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCategories } from "@/lib/api/category";
import { useDeleteProduct, useGetAdminProducts } from "@/lib/api/product";
import type { Category } from "@/types";
import { FilterX, Search } from "lucide-react";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { useDebounceValue } from "usehooks-ts";
import { ProductsTable } from "./components";

export default function AdminProductsPage() {
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(5),
      search: parseAsString.withDefault(""),
      categoryId: parseAsString.withDefault("all"),
      isActive: parseAsString.withDefault("all"),
    },
    {
      shallow: false,
      history: "push",
    },
  );

  const [debouncedSearch] = useDebounceValue(params.search, 600);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categoriesData } = useGetCategories();
  const { data: adminProducts, isLoading } = useGetAdminProducts({
    page: params.page,
    limit: params.limit,
    search: debouncedSearch,
    categoryId: params.categoryId === "all" ? undefined : params.categoryId,
    isActive:
      params.isActive === "all" ? undefined : params.isActive === "true",
  });

  const deleteMutation = useDeleteProduct();

  const handleSearchChange = (value: string) => {
    setParams({
      search: value,
      page: 1,
    });
  };

  const handleCategoryChange = (value?: string) => {
    setParams({
      categoryId: value || "all",
      page: 1,
    });
  };

  const handleStatusChange = (value?: string) => {
    setParams({
      isActive: value || "all",
      page: 1,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Product deleted successfully");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const clearFilters = () => {
    setParams({
      search: "",
      categoryId: "all",
      isActive: "all",
      page: 1,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Manage your storefront inventory and catalogs.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50/50 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-10 h-11 rounded-xl border-gray-200 focus:ring-emerald-500"
                value={params.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Combobox
              options={[
                { value: "all", label: "All Categories" },
                ...(categoriesData?.map((cat: Category) => ({
                  value: cat.id,
                  label: cat.name,
                })) || []),
              ]}
              value={params.categoryId}
              onValueChange={handleCategoryChange}
              placeholder="All Categories"
              searchPlaceholder="Search category..."
              triggerClassName="w-[200px]"
            />

            <Combobox
              options={[
                { value: "all", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Hidden" },
              ]}
              value={params.isActive}
              onValueChange={handleStatusChange}
              placeholder="All Status"
              searchPlaceholder="Search status..."
              triggerClassName="w-[150px]"
            />

            {(params.search ||
              params.categoryId !== "all" ||
              params.isActive !== "all") && (
              <Button onClick={clearFilters}>
                <FilterX className="h-4 w-4 mr-2" /> Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            <ProductsTable
              products={adminProducts?.data || []}
              handleDelete={(id: string) => setDeleteId(id)}
            />
            {adminProducts?.data.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <Search className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  No products found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </>
        )}

        {adminProducts?.meta && adminProducts.meta.totalPage > 1 && (
          <div className="p-4 border-t bg-gray-50/30">
            <AppPagination
              currentPage={params.page}
              totalPages={adminProducts.meta.totalPage || 1}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}
      </div>

      <AdminDeleteDialog
        open={!!deleteId}
        title="Delete Product?"
        description="This action cannot be undone. This will permanently delete the product and remove its data from our servers."
        confirmLabel="Delete Product"
        isDeleting={deleteMutation.isPending}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
