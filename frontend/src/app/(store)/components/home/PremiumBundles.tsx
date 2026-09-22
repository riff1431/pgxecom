"use client";

import { CURRENCY } from "@/lib/constants";
import { useCartStore } from "@/store/cart.store";
import { Check, ShieldCheck, Sparkles, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface BundleItem {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  badge?: string;
  image?: string;
  features: string[];
}

export const PGX_BUNDLES: BundleItem[] = [
  {
    id: "bundle-complete-home-gym",
    name: "PGX COMPLETE HOME GYM BUNDLE",
    badge: "BEST VALUE",
    price: 2999.0,
    comparePrice: 3499.0,
    image: "/placeholder-product.jpg",
    features: [
      "Power Rack",
      "Adjustable Bench",
      "120kg Weight Plates",
      "Barbell & Dumbbells",
      "Floor Mat",
      "Accessories Pack",
    ],
  },
  {
    id: "bundle-cardio-essentials",
    name: "PGX CARDIO ESSENTIALS BUNDLE",
    price: 3499.0,
    comparePrice: 3899.0,
    image: "/placeholder-product.jpg",
    features: [
      "Treadmill X1",
      "Exercise Bike",
      "Rowing Machine",
      "Heart Rate Monitor",
    ],
  },
  {
    id: "bundle-strength-starter",
    name: "PGX STRENGTH STARTER BUNDLE",
    price: 1199.0,
    comparePrice: 1399.0,
    image: "/placeholder-product.jpg",
    features: [
      "Adjustable Dumbbells",
      "Training Bench",
      "Kettlebells Set",
      "Resistance Bands",
      "Gym Mat",
    ],
  },
  {
    id: "bundle-lifestyle-pack",
    name: "PGX LIFESTYLE PACK",
    price: 499.0,
    comparePrice: 599.0,
    image: "/placeholder-product.jpg",
    features: [
      "Apparel Set (3 pieces)",
      "Gym Bag",
      "Stainless Bottle",
      "Wireless Headphones",
      "Towel",
      "Accessories",
    ],
  },
];

export function PremiumBundlesSection() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section className="py-12 bg-[#060b13] text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-mono">
              Premium Bundles
            </h2>
            <p className="text-slate-400 text-sm mt-0.5">
              More value. Everything you need. Save big.
            </p>
          </div>
          <Link
            href="/shop?category=bundles"
            className="text-xs sm:text-sm font-bold text-[#00a3ff] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            View All Bundles →
          </Link>
        </div>

        {/* Bundle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PGX_BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              className="relative bg-[#0b121f] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-[#00a3ff]/50 hover:shadow-2xl hover:shadow-[#00a3ff]/10 transition-all duration-300 group"
            >
              {/* Badge */}
              {bundle.badge && (
                <div className="absolute top-4 right-4 bg-[#00a3ff] text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded shadow-md">
                  {bundle.badge}
                </div>
              )}

              <div>
                {/* Title */}
                <h3 className="font-black text-base text-white uppercase tracking-tight leading-snug mb-4 pr-16 font-mono">
                  {bundle.name}
                </h3>

                {/* Features Checklist */}
                <ul className="space-y-2 mb-6">
                  {bundle.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-300 font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-[#00a3ff] shrink-0 stroke-[3]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* Bundle Visual Preview */}
                <div className="w-full aspect-[16/10] bg-[#060b13] rounded-xl border border-slate-800/80 p-3 mb-6 flex items-center justify-center overflow-hidden">
                  <Image
                    src={bundle.image || "/placeholder-product.jpg"}
                    alt={bundle.name}
                    width={220}
                    height={160}
                    className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="font-black text-xl text-white">
                    {CURRENCY}
                    {bundle.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  {bundle.comparePrice && (
                    <div className="text-xs text-slate-500 line-through">
                      {CURRENCY}
                      {bundle.comparePrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    addItem({
                      productId: bundle.id,
                      name: bundle.name,
                      price: bundle.price,
                      quantity: 1,
                      stock: 15,
                      image: bundle.image || "/placeholder-product.jpg",
                    })
                  }
                  className="px-5 py-2.5 rounded-lg bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors active:scale-95 shadow-md shadow-[#00a3ff]/20"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ValuePropositionStrip() {
  const values = [
    {
      title: "Free Shipping",
      desc: "on orders over €50",
      icon: "🚚",
    },
    {
      title: "Secure Checkout",
      desc: "Powered by Stripe",
      icon: "🔒",
    },
    {
      title: "Easy Returns",
      desc: "30-day hassle free",
      icon: "📦",
    },
    {
      title: "Worldwide Shipping",
      desc: "to 50+ countries",
      icon: "🌐",
    },
    {
      title: "A Healthier Tomorrow",
      desc: "Starts Today.",
      icon: "🌿",
    },
  ];

  return (
    <section className="bg-[#f8fafc] border-y border-slate-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {values.map((v, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{v.icon}</span>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {v.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
