"use client";

import { ProductCard } from "@/components/storefront/product/ProductCard";
import { useGetProducts } from "@/lib/api/product";
import Link from "next/link";
import {
  HeroSection,
  QuickCategoriesBar,
} from "./components/home/HeroAndFeatures";
import {
  PremiumBundlesSection,
  ValuePropositionStrip,
} from "./components/home/PremiumBundles";

// Curated static fallback data matching screenshot if database is still seeding/empty
const SCREENSHOT_FEATURED_EQUIPMENT = [
  {
    id: "pgx-pro-treadmill-x1",
    name: "PGX Pro Treadmill X1",
    slug: "pgx-pro-treadmill-x1",
    shortDesc: "Smart • Foldable • 22km/h",
    price: 1899.0,
    rating: 5,
    reviewCount: 124,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-smart-exercise-bike",
    name: "PGX Smart Exercise Bike",
    slug: "pgx-smart-exercise-bike",
    shortDesc: "Interactive • Quiet • App Ready",
    price: 1299.0,
    rating: 5,
    reviewCount: 98,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-adjustable-dumbbells",
    name: "PGX Adjustable Dumbbells",
    slug: "pgx-adjustable-dumbbells",
    shortDesc: "5-50kg Set • Space Saving",
    price: 599.0,
    rating: 5,
    reviewCount: 87,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-power-rack-package",
    name: "PGX Power Rack Package",
    slug: "pgx-power-rack-package",
    shortDesc: "Rack • Bench • 120kg Plates",
    price: 1599.0,
    rating: 5,
    reviewCount: 72,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-rowing-machine",
    name: "PGX Rowing Machine",
    slug: "pgx-rowing-machine",
    shortDesc: "Air Resistance • Full Body",
    price: 1099.0,
    rating: 5,
    reviewCount: 64,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-home-gym-system",
    name: "PGX Home Gym System",
    slug: "pgx-home-gym-system",
    shortDesc: "All-in-One • 100kg Stack",
    price: 2499.0,
    rating: 5,
    reviewCount: 90,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
];

const SCREENSHOT_POPULAR_ESSENTIALS = [
  {
    id: "pgx-performance-tshirt",
    name: "PGX Performance T-Shirt",
    slug: "pgx-performance-tshirt",
    shortDesc: "Men's | Black",
    price: 34.99,
    rating: 5,
    reviewCount: 241,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-leggings",
    name: "PGX Leggings",
    slug: "pgx-leggings",
    shortDesc: "Women's | Black",
    price: 49.99,
    rating: 5,
    reviewCount: 198,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-training-shoes",
    name: "PGX Training Shoes",
    slug: "pgx-training-shoes",
    shortDesc: "Unisex | Breathable",
    price: 89.99,
    rating: 5,
    reviewCount: 167,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-gym-bag",
    name: "PGX Gym Bag",
    slug: "pgx-gym-bag",
    shortDesc: "Spacious | Durable",
    price: 59.99,
    rating: 5,
    reviewCount: 143,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-stainless-bottle",
    name: "PGX Stainless Bottle",
    slug: "pgx-stainless-bottle",
    shortDesc: "750ml | Insulated",
    price: 59.99,
    rating: 5,
    reviewCount: 312,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-yoga-mat",
    name: "PGX Yoga Mat",
    slug: "pgx-yoga-mat",
    shortDesc: "Anti-Slip | 6mm",
    price: 29.99,
    rating: 5,
    reviewCount: 121,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-resistance-bands",
    name: "PGX Resistance Bands",
    slug: "pgx-resistance-bands",
    shortDesc: "Set of 5 | Varied Resistance",
    price: 24.99,
    rating: 5,
    reviewCount: 276,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
  {
    id: "pgx-wireless-headphones",
    name: "PGX Wireless Headphones",
    slug: "pgx-wireless-headphones",
    shortDesc: "Noise Cancelling",
    price: 79.99,
    rating: 5,
    reviewCount: 184,
    images: [{ url: "/uploads/placeholder-product.jpg" }],
  },
];

export default function HomePage() {
  const { data: apiProducts, isLoading } = useGetProducts({ limit: 50 });

  // Filter or fall back to matching items from screenshot
  const featuredEquipment =
    apiProducts?.data?.filter((p) =>
      ["cardio-equipment", "strength-equipment", "home-gym"].includes(
        p.category?.slug
      )
    ) || [];

  const popularEssentials =
    apiProducts?.data?.filter((p) =>
      ["apparel", "accessories", "bags", "wellness"].includes(p.category?.slug)
    ) || [];

  const equipmentToRender =
    featuredEquipment.length >= 4
      ? featuredEquipment.slice(0, 6)
      : SCREENSHOT_FEATURED_EQUIPMENT;

  const essentialsToRender =
    popularEssentials.length >= 4
      ? popularEssentials.slice(0, 8)
      : SCREENSHOT_POPULAR_ESSENTIALS;

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Categories Bar */}
      <QuickCategoriesBar />

      {/* 3. Featured Fitness Equipment Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 font-mono">
                Featured Fitness Equipment
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Top-rated equipment for your home, gym or office.
              </p>
            </div>
            <Link
              href="/shop?category=strength-equipment"
              className="text-xs sm:text-sm font-bold text-[#00a3ff] hover:underline uppercase tracking-wider"
            >
              View All Equipment →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {equipmentToRender.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Popular Categories / Everyday Essentials Section */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 font-mono">
                Popular Categories
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Everyday essentials for your lifestyle.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-xs sm:text-sm font-bold text-[#00a3ff] hover:underline uppercase tracking-wider"
            >
              View All Products →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {essentialsToRender.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Premium Bundles Section */}
      <PremiumBundlesSection />

      {/* 6. Value Proposition Strip */}
      <ValuePropositionStrip />
    </div>
  );
}
