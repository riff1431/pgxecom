"use client";

import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAdminProduct } from "@/lib/api/product";
import { ChevronLeft, Package } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, isError } = useGetAdminProduct(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg bg-muted" />
            <Skeleton className="h-4 w-32 rounded-lg bg-muted" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-100 w-full bg-muted" />
            <Skeleton className="h-50 w-full bg-muted" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-75 w-full bg-muted" />
            <Skeleton className="h-50 w-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card border-2 border-dashed border-border rounded-2xl text-card-foreground">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-500">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2 font-mono uppercase">
          Product Not Found
        </h2>
        <p className="text-muted-foreground font-medium mb-8 text-xs">
          The product you are trying to edit does not exist or has been removed.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl">
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="border-border bg-background text-foreground hover:bg-muted h-10 w-10 rounded-xl"
        >
          <Link href="/admin/products">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight font-mono uppercase">
            Edit Product
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-medium">
              Updating:
            </span>
            <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <ProductForm
        key={`${product.id}-${product.updatedAt || ""}-${product.images?.length || 0}`}
        initialData={product}
        productId={product.id}
      />
    </div>
  );
}
