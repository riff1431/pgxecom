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
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-100 w-full " />
            <Skeleton className="h-50 w-full " />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-75 w-full " />
            <Skeleton className="h-50 w-full " />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white  border-2 border-dashed border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-red-200" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 font-medium mb-8">
          The product you are trying to edit does not exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/admin/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Edit Product
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-gray-500 font-medium tracking-tight">
              Updating:
            </span>
            <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <ProductForm initialData={product} productId={product.id} />
    </div>
  );
}
