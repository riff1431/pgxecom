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
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

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
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">
            Products
          </h1>
          <p className="text-muted-foreground font-medium text-xs mt-1">
            Manage your storefront inventory and catalogs.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl shadow-xs transition-all"
        >
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-xs border border-border overflow-hidden text-card-foreground">
        <div className="p-4 border-b border-border bg-muted/20 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or SKU..."
                className="pl-10 h-11 rounded-xl border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary"
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
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-border bg-background text-foreground hover:bg-muted font-mono text-xs"
              >
                <FilterX className="h-4 w-4 mr-2" /> Clear
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-16 rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <>
            <ProductsTable
              products={adminProducts?.data || []}
              handleDelete={(id: string) => setDeleteId(id)}
            />
            {adminProducts?.data.length === 0 && (
              <AdminEmptyState
                title="No products found"
                description="Try adjusting your filters or search terms."
              />
            )}
          </>
        )}

        {adminProducts?.meta && adminProducts.meta.totalPage > 1 && (
          <div className="p-4 border-t border-border bg-muted/20">
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
