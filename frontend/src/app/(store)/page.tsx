"use client";

import { ProductCard } from "@/components/storefront/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/lib/api/product";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import {
  HeroSection,
  QuickCategoriesBar,
} from "./components/home/HeroAndFeatures";
import {
  ValuePropositionStrip,
} from "./components/home/PremiumBundles";

export default function HomePage() {
  const { data: apiProducts, isLoading } = useGetProducts({ limit: 50 });

  // Reverse products so the newest items come first
  const reversedProducts = apiProducts?.data ? [...apiProducts.data] : [];

  const equipmentToRender = reversedProducts.slice(0, 6);
  const essentialsToRender = reversedProducts.slice(0, 8);

  return (
    <div className="bg-background min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Categories Bar */}
      <QuickCategoriesBar />

      {/* 3. Featured Fitness Equipment Section */}
      <section className="py-12 bg-background border-b border-border/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground font-mono">
                Featured Fitness Equipment
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Top-rated equipment for your home, gym or office.
              </p>
            </div>
            <Link
              href="/shop?category=strength-equipment"
              className="text-xs sm:text-sm font-bold text-primary hover:underline uppercase tracking-wider"
            >
              View All Equipment →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="space-y-3 p-4 border border-border rounded-xl">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : equipmentToRender.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {equipmentToRender.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-muted/20">
              <PackageOpen className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-base font-semibold text-foreground">No products available</p>
              <p className="text-sm text-muted-foreground mt-1">
                There are currently no featured fitness equipment items listed.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. Popular Categories / Everyday Essentials Section */}
      <section className="py-12 bg-background border-b border-border/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground font-mono">
                Popular Products
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                Everyday essentials for your lifestyle.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-bold text-primary hover:underline uppercase tracking-wider"
            >
              View All Products →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-3 p-4 border border-border rounded-xl">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : essentialsToRender.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {essentialsToRender.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-muted/20">
              <PackageOpen className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-base font-semibold text-foreground">No products available</p>
              <p className="text-sm text-muted-foreground mt-1">
                There are currently no popular category items listed.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Premium Bundles Section */}
      {/* <PremiumBundlesSection /> */}

      {/* 6. Value Proposition Strip */}
      <ValuePropositionStrip />
    </div>
  );
}
