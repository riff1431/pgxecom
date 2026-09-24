"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AppPagination } from "@/components/shared/AppPagination";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminCategories } from "@/lib/api/category";
import type { Category } from "@/types";
import { Loader2, Search } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { CategoriesTable } from "./components/CategoriesTable";
import { CategoryDialog } from "./components/CategoryDialog";

export default function AdminCategoriesPage() {
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(5),
      search: parseAsString.withDefault(""),
    },
    {
      shallow: false,
      history: "push",
    },
  );

  const [debouncedSearch] = useDebounceValue(params.search, 600);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data, isLoading } = useGetAdminCategories({
    search: debouncedSearch,
    page: params.page,
    limit: params.limit,
  });

  const categories = data?.data || [];
  const meta = data?.meta;

  const handleCreate = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParams({
      search: e.target.value,
      page: 1,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <AdminPageHeader
        title="Catalog Management"
        description="Manage product categories and hierarchies."
        actionLabel="Add Category"
        onAction={handleCreate}
      />

      <div className="bg-[#0b1322] rounded-xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between bg-[#080e18]">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Find category..."
              className="pl-12 h-12 rounded-xl border-slate-700 bg-slate-900/90 text-white placeholder:text-slate-500 shadow-inner"
              value={params.search}
              onChange={handleSearch}
            />
          </div>
          {isLoading && (
            <Loader2 className="h-5 w-5 animate-spin text-[#00a3ff]" />
          )}
        </div>

        <div className="min-h-100">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-16 rounded-2xl bg-slate-800/60" />
              ))}
            </div>
          ) : (
            <CategoriesTable categories={categories} onEdit={handleEdit} />
          )}
        </div>

        {!isLoading && categories.length > 0 && (
          <div className="p-6 border-t border-slate-800/80 bg-[#080e18]">
            <AppPagination
              currentPage={params.page}
              totalPages={meta?.totalPage || 1}
              onPageChange={(page) => setParams({ page })}
            />
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              No categories found
            </p>
          </div>
        )}
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        category={selectedCategory}
      />
    </div>
  );
}
