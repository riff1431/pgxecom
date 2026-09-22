"use client";

import {
  Activity,
  ArrowRight,
  ChevronRight,
  Dumbbell,
  DumbbellIcon,
  GalleryThumbnails,
  Gift,
  Heart,
  Layers,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative bg-[#060b13] text-white overflow-hidden border-b border-slate-800">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-banner.jpg"
          alt="PGX Athletic Performance"
          fill
          priority
          className="object-cover object-center opacity-40 mix-blend-luminosity filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#060b13] via-[#060b13]/85 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b13] via-transparent to-transparent z-10" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Content (Left 7 cols) */}
          <div className="lg:col-span-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase font-bold text-slate-400">
                Discipline Today.
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-none mb-4 font-mono">
              A Stronger <br />
              <span className="text-[#00a3ff]">Tomorrow.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 font-normal leading-relaxed mb-8 max-w-xl">
              Premium fitness equipment, apparel and everyday essentials for a
              healthier, happier you.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-[#00a3ff] hover:bg-[#0091e6] text-slate-950 font-black text-sm uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#00a3ff]/20 active:translate-y-0"
              >
                Shop Now <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-5 h-5 text-[#00a3ff] shrink-0" />
                <div className="text-[11px] leading-tight font-bold tracking-wide uppercase text-slate-300">
                  Premium <br />
                  <span className="text-slate-500 font-medium">Quality</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-[#00a3ff] shrink-0" />
                <div className="text-[11px] leading-tight font-bold tracking-wide uppercase text-slate-300">
                  Worldwide <br />
                  <span className="text-slate-500 font-medium">Shipping</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#00a3ff] shrink-0" />
                <div className="text-[11px] leading-tight font-bold tracking-wide uppercase text-slate-300">
                  Secure <br />
                  <span className="text-slate-500 font-medium">Checkout</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-[#00a3ff] shrink-0" />
                <div className="text-[11px] leading-tight font-bold tracking-wide uppercase text-slate-300">
                  A Healthier <br />
                  <span className="text-slate-500 font-medium">Tomorrow</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Quick-Jump Menu (Right 4 cols) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col justify-center items-end">
            <div className="bg-[#0b121f]/90 backdrop-blur-md border border-slate-800 rounded-xl p-5 w-72 shadow-2xl space-y-4">
              <div className="space-y-2">
                {[
                  {
                    name: "PREMIUM FITNESS EQUIPMENT",
                    icon: Dumbbell,
                    href: "/shop?category=strength-equipment",
                  },
                  {
                    name: "APPAREL & LIFESTYLE",
                    icon: Layers,
                    href: "/shop?category=apparel",
                  },
                  {
                    name: "ACCESSORIES",
                    icon: Package,
                    href: "/shop?category=accessories",
                  },
                  {
                    name: "HOME & OFFICE",
                    icon: Activity,
                    href: "/shop?category=home-office",
                  },
                  {
                    name: "BUNDLES & DEALS",
                    icon: Gift,
                    href: "/shop?category=bundles",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 transition-all text-xs font-bold text-slate-300 hover:text-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-[#00a3ff] group-hover:scale-110 transition-transform" />
                        <span className="tracking-tight">{item.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#00a3ff] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-right">
                <span className="font-serif italic text-sm text-[#00a3ff]">
                  &ldquo;More Than Gear, A Better You&rdquo;
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function QuickCategoriesBar() {
  const quickCategories = [
    { name: "Cardio Equipment", slug: "cardio-equipment" },
    { name: "Strength Equipment", slug: "strength-equipment" },
    { name: "Home Gym", slug: "home-gym" },
    { name: "Accessories", slug: "accessories" },
    { name: "Apparel", slug: "apparel" },
    { name: "Bags", slug: "bags" },
    { name: "Wellness", slug: "wellness" },
    { name: "Home & Office", slug: "home-office" },
    { name: "Bundles", slug: "bundles" },
  ];

  return (
    <section className="bg-[#f8fafc] border-b border-slate-200 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center shrink-0 min-w-[100px] text-center"
            >
              <DumbbellIcon />
              <span className="mt-2 text-xs font-semibold text-slate-800 group-hover:text-[#00a3ff] flex items-center gap-1">
                {cat.name} <span className="text-[10px] text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
