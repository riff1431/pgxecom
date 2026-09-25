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
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
            Limited Time Promotions
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono flex items-center justify-center gap-3">
            <Tag className="w-8 h-8 text-primary" /> Special Offers &amp; Bundles
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base mt-2">
            Save on professional strength packages, cardio equipment, and athlete accessories.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-2xl mx-auto p-8 shadow-xs">
            <p className="text-lg font-bold text-foreground font-mono uppercase">
              No promotional offers active at this moment
            </p>
            <p className="text-muted-foreground text-sm mt-1">Check back soon or explore our complete catalog.</p>
            <Link href="/shop" className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider transition-colors shadow-xs">
              Browse All Gear
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product: any) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-border rounded-xl hover:shadow-md hover:border-primary/40 transition-all flex flex-col bg-card"
              >
                <div className="relative bg-muted/40 aspect-square flex items-center justify-center p-4">
                  <div className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs z-10">
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
                    <h3 className="font-mono font-bold text-card-foreground line-clamp-2 hover:text-primary transition-colors mb-2 text-sm uppercase">
                      <Link href={`/product/${product.slug}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono font-black text-foreground text-lg">
                        {CURRENCY}
                        {Number(product.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through font-mono">
                        {CURRENCY}
                        {Number(product.comparePrice).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="w-full h-9 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors mt-auto"
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
