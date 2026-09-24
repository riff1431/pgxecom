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
          <Skeleton className="h-10 w-10 rounded-xl bg-slate-800" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg bg-slate-800" />
            <Skeleton className="h-4 w-32 rounded-lg bg-slate-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-100 w-full bg-slate-800" />
            <Skeleton className="h-50 w-full bg-slate-800" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-75 w-full bg-slate-800" />
            <Skeleton className="h-50 w-full bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#0b1322] border-2 border-dashed border-slate-800 rounded-2xl text-slate-100">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6 text-red-400">
          <Package className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 font-mono uppercase">
          Product Not Found
        </h2>
        <p className="text-slate-400 font-medium mb-8 text-xs">
          The product you are trying to edit does not exist or has been removed.
        </p>
        <Button asChild className="bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-bold font-mono text-xs uppercase px-5 h-10 rounded-xl">
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
          className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white h-10 w-10 rounded-xl"
        >
          <Link href="/admin/products">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono uppercase">
            Edit Product
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-medium">
              Updating:
            </span>
            <span className="text-xs font-mono font-bold text-[#00a3ff] bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-md">
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
