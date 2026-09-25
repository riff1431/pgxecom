"use client";

import { CURRENCY } from "@/lib/constants";
import { cn, resolveImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: any;
  viewMode?: "grid" | "list";
  className?: string;
}

export function ProductCard({
  product,
  viewMode = "grid",
  className,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const isList = viewMode === "list";

  const rawImg = product.images?.[0]?.url || "/placeholder-product.jpg";
  const imageUrl = resolveImageUrl(rawImg);

  // Dynamic tag: Featured, Trending (isHot), or Sale
  let tag: { text: string; bgClass: string; textClass: string } | null = null;
  if (product.isFeatured) {
    tag = {
      text: "Featured",
      bgClass: "bg-[#22c55e]",
      textClass: "text-white",
    };
  } else if (product.isHot) {
    tag = {
      text: "Trending",
      bgClass: "bg-[#22c55e]",
      textClass: "text-white",
    };
  } else if (
    product.comparePrice &&
    Number(product.comparePrice) > Number(product.price)
  ) {
    tag = {
      text: "Sale",
      bgClass: "bg-primary",
      textClass: "text-primary-foreground",
    };
  }

  // Short description or specifications clean text
  const cleanDescription = (product.shortDesc || product.weight || "")
    .replace(/<[^>]*>?/gm, "")
    .trim();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      image: imageUrl,
    });
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setIsAdding(false), 500);
  };

  if (isList) {
    return (
      <div
        className={cn(
          "group relative bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-300 flex flex-row items-center gap-5 p-4",
          className
        )}
      >
        {/* Product Image Container */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 overflow-hidden flex items-center justify-center p-2">
          {tag && (
            <span
              className={cn(
                "absolute top-2 left-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full z-10 shadow-xs",
                tag.bgClass,
                tag.textClass
              )}
            >
              {tag.text}
            </span>
          )}

          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full relative"
          >
            <Image
              fill
              unoptimized
              src={imageUrl}
              alt={product.name}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        </div>

        {/* Info & Details */}
        <div className="flex flex-col flex-1 justify-between gap-3 h-full py-1">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-1 mb-1.5">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>

            {cleanDescription && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {cleanDescription}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-foreground text-lg sm:text-xl">
                {CURRENCY}
                {Number(product.price).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {product.comparePrice &&
                Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-xs text-muted-foreground line-through font-medium">
                    {CURRENCY}
                    {Number(product.comparePrice).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                )}
            </div>

            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary text-foreground shadow-xs transition-all active:scale-95",
                isAdding && "scale-90 bg-primary text-primary-foreground"
              )}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view matching reference image:
  // - Padded transparent image container (no contrasting background box, no double border)
  // - Clean typography with line clamp
  // - Bottom-right inverted corner cutout / notch housing the separated cart button pod
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between transition-all duration-300",
        className
      )}
    >
      {/* Main Card Surface */}
      <div className="relative bg-card rounded-2xl border border-border p-2 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
        <div>
          {/* Transparent Image Area */}
          <div className="relative w-full aspect-square overflow-hidden flex items-center justify-center">
            {/* Dynamic Tag */}
            {tag && (
              <span
                className={cn(
                  "absolute top-1 left-1 text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full z-10 shadow-xs",
                  tag.bgClass,
                  tag.textClass
                )}
              >
                {tag.text}
              </span>
            )}

            <Link
              href={`/product/${product.slug}`}
              className="block w-full h-full relative"
            >
              <Image
                fill
                unoptimized
                src={imageUrl}
                alt={product.name}
                className="object-contain rounded-xl"
              />
            </Link>
          </div>

          {/* Details */}
          <div className="pt-1 px-2">
            <h3 className="font-bold text-base sm:text-lg text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>

            <p className="text-xs sm:text-[13px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed min-h-[2.5rem]">
              {cleanDescription || "Lightweight, durable, and built for peak performance every step of the way."}
            </p>
          </div>
        </div>

        {/* Bottom Section: Price */}
        <div className="relative px-2 flex items-end justify-between min-h-[52px]">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-black text-foreground text-lg sm:text-xl tracking-tight">
              {CURRENCY}
              {Number(product.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {product.comparePrice &&
              Number(product.comparePrice) > Number(product.price) && (
                <span className="text-xs text-muted-foreground line-through font-medium">
                  {CURRENCY}
                  {Number(product.comparePrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
          </div>
          {/* Add to Card */}
          {/* <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center bg-card border border-border shadow-md hover:shadow-lg hover:border-primary/50 hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-200 active:scale-90 group/btn",
            isAdding && "scale-90 bg-primary text-primary-foreground"
          )}
        >
          <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
        </button> */}
        </div>
      </div>

      {/* Separated Floating Cart Button Pod, overlapping the card's rounded corner */}
      <div className="absolute -bottom-3 -right-3 z-20">
        <button
          onClick={handleAddToCart}
          aria-label="Add to cart"
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center bg-card border border-border shadow-md hover:shadow-lg hover:border-primary/50 hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-200 active:scale-90 group/btn",
            isAdding && "scale-90 bg-primary text-primary-foreground"
          )}
        >
          <ShoppingCart className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
        </button>
      </div>
    </div>
  );
}
