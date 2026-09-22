"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { CURRENCY } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      // For now fetching products that have a comparePrice > price
      // In a real app we'd have a specific backend endpoint
      const res = await api.get("/products?limit=50");
      return (
        res.data?.data?.filter(
          (p: any) => p.comparePrice && p.comparePrice > p.price,
        ) || []
      );
    },
  });

  const products = data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 items-center justify-center flex gap-3">
          <Tag className="w-8 h-8 text-emerald-600" /> Special Offers
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover our latest deals and discounts on your favorite products.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border">
          <p className="text-xl text-gray-500">
            No active offers at the moment. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="relative bg-gray-100 aspect-square">
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Sale
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="block w-full h-full"
                >
                  <img
                    src={resolveImageUrl(product.images?.[0]?.url)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>
              <CardContent className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-2 hover:text-emerald-600 mb-2">
                    <Link href={`/product/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-bold text-emerald-600 text-lg">
                      {CURRENCY}
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {CURRENCY}
                      {product.comparePrice}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
