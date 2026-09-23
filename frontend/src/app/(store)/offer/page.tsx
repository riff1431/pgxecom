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
    <div className="bg-white min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00a3ff]">
            Limited Time Promotions
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono flex items-center justify-center gap-3">
            <Tag className="w-8 h-8 text-[#00a3ff]" /> Special Offers &amp; Bundles
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base mt-2">
            Save on professional strength packages, cardio equipment, and athlete accessories.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-[#f8fafc] rounded-3xl border border-slate-200/80 max-w-2xl mx-auto p-8">
            <p className="text-lg font-bold text-slate-700 font-mono uppercase">
              No promotional offers active at this moment
            </p>
            <p className="text-slate-500 text-sm mt-1">Check back soon or explore our complete catalog.</p>
            <Link href="/shop" className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-lg bg-[#060b13] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors">
              Browse All Gear
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-slate-200/90 rounded-2xl hover:shadow-xl hover:border-slate-300 transition-all flex flex-col"
              >
                <div className="relative bg-[#f8fafc] aspect-square flex items-center justify-center p-4">
                  <div className="absolute top-2.5 left-2.5 bg-[#00a3ff] text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm z-10">
                    SALE
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={resolveImageUrl(product.images?.[0]?.url)}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                  </Link>
                </div>
                <CardContent className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-mono font-bold text-slate-900 line-clamp-2 hover:text-[#00a3ff] transition-colors mb-2 text-sm uppercase">
                      <Link href={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono font-black text-slate-900 text-lg">
                        {CURRENCY}
                        {Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400 line-through font-mono">
                        {CURRENCY}
                        {Number(product.comparePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="w-full h-9 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors mt-auto"
                  >
                    View Details
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
