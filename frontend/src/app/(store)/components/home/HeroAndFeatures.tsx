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
  const floatingCards = [
    {
      title: "Air Max 270",
      price: "$129.99",
      image: "/hero-card-sneaker.jpg",
      className: "top-4 -left-4 sm:top-6 sm:left-4 md:-left-6 lg:left-0",
      href: "/shop?search=sneaker",
    },
    {
      title: "Smart Watch",
      price: "$199.99",
      image: "/hero-card-watch.jpg",
      className: "top-2 -right-2 sm:top-4 sm:right-6 lg:right-4",
      href: "/shop?search=watch",
    },
    {
      title: "Wireless Headphones",
      price: "$99.99",
      image: "/hero-card-headphones.jpg",
      className: "bottom-24 -left-4 sm:bottom-28 sm:left-2 md:-left-4 lg:-left-2",
      href: "/shop?search=headphones",
    },
    {
      title: "Water Bottle",
      price: "$24.99",
      image: "/hero-card-bottle.jpg",
      className: "bottom-12 -right-2 sm:bottom-16 sm:right-8 lg:right-2",
      href: "/shop?search=bottle",
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-background via-muted/20 to-background text-foreground overflow-hidden border-b border-border">
      {/* Subtle radial ambient backdrop */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 pt-10 pb-8 md:pt-16 md:pb-12 lg:pt-20 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle, Actions & Social Proof */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center space-y-6 text-center lg:text-left">
            {/* Trending Badge */}
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Trending Now
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1] font-mono">
              Discover Products <br />
              <span className="text-primary">You&apos;ll Love</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Shop the latest trending products curated for modern lifestyles. Premium fitness gear, apparel, and everyday performance essentials.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-wide transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
              >
                Shop Now <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-background hover:bg-muted text-foreground border border-border font-bold text-sm tracking-wide transition-all hover:border-primary/40 active:scale-[0.98]"
              >
                Explore Collection
              </Link>
            </div>

            {/* Social Proof Avatars */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-3">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                  alt="Customer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
                  alt="Customer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
                  alt="Customer avatar"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces"
                  alt="Customer avatar"
                />
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                Loved by <strong className="text-foreground font-bold">50,000+</strong> customers worldwide
              </p>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase with Floating Cards */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex justify-center items-center min-h-[440px] sm:min-h-[500px] md:min-h-[560px]">
            {/* Soft decorative background glow ring */}
            <div className="absolute inset-0 max-w-[500px] max-h-[500px] m-auto rounded-full bg-gradient-to-tr from-primary/20 via-sky-400/10 to-transparent blur-2xl pointer-events-none" />

            {/* Central Lifestyle Model */}
            <div className="relative z-10 w-full max-w-[380px] sm:max-w-[440px] md:max-w-[500px] aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-card">
              <Image
                src="/hero-model.jpg"
                alt="PGX Lifestyle and Sportswear"
                fill
                priority
                className="object-cover object-top filter contrast-[1.02]"
              />
            </div>

            {/* Floating Interactive Product Cards */}
            {floatingCards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                className={`absolute z-20 ${card.className} hidden sm:flex items-center gap-3 p-2.5 sm:p-3 bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-lg hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all group`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="pr-2">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-[11px] font-mono font-semibold text-primary mt-0.5">
                    {card.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4 Feature Pillars (Underneath Hero) */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                Free Shipping
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                On orders over $50
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                Secure Payments
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                100% secure checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                Easy Returns
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                30-day return policy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                24/7 Support
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Always here to help
              </p>
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
    <section className="bg-background border-b border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-2">
          {quickCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center shrink-0 min-w-[100px] text-center p-2 rounded-lg hover:bg-muted/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <DumbbellIcon className="w-5 h-5" />
              </div>
              <span className="mt-2 text-xs font-semibold text-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                {cat.name} <span className="text-[10px] text-muted-foreground group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
