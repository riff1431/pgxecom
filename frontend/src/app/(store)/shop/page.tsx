"use client";

import { ProductCard } from "@/components/storefront/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopParams } from "@/hooks/use-shop-params";
import { useCategoryTree } from "@/lib/api/category";
import { useGetProducts } from "@/lib/api/product";
import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import { Pagination } from "./components/Pagination";
import { ShopFilters } from "./components/ShopFilters";
import { ShopHeader } from "./components/ShopHeader";

function ShopContent() {
  const [{ search, category, view, sort, page }, setParams] = useShopParams();

  const { data: productsData, isLoading } = useGetProducts({
    search,
    category,
    sort,
    page: page,
    limit: 24,
  });

  const { data: categoryTreeData } = useCategoryTree();
  const categoryTree = categoryTreeData?.tree || [];
  const products = productsData?.data || [];

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      <ShopFilters
        categories={categoryTree}
        activeCategory={category}
        setActiveCategory={(slug) => setParams({ category: slug, page: 1 })}
      />

      <div className="flex-1">
        <ShopHeader
          search={search}
          totalProducts={productsData?.meta?.total || 0}
          viewMode={view as "grid" | "list"}
          setViewMode={(mode) => setParams({ view: mode })}
          sort={sort}
          setSort={(s) => setParams({ sort: s, page: 1 })}
        />

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800">
              No products found
            </h3>
            <p className="text-gray-500 mt-1">
              Try adjusting your filters or search term.
            </p>
            <Button
              onClick={() => setParams({ category: "", search: "", page: 1 })}
              className="mt-4"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={view as "grid" | "list"}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={productsData?.meta?.totalPage || 1}
              onPageChange={(p) => setParams({ page: p })}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
