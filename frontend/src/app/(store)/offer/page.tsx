"use client";

import { ProductCard } from "@/components/storefront/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
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
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
