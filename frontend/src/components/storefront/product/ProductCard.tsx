"use client";

import { CURRENCY } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cart.store";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: any;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isList = viewMode === "list";

  const rawImg = product.images?.[0]?.url || "/placeholder-product.jpg";
  const imageUrl = resolveImageUrl(rawImg);

  // Subtitle/Specs or short description
  const specs = product.shortDesc || product.weight || "";
  const rating = product.rating || 5;
  const reviewCount = product.reviewCount || 85;

  return (
    <div
      className={`group bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex ${
        isList ? "flex-row items-center gap-6 p-4" : "flex-col"
      }`}
    >
      {/* Product Image Container */}
      <div
        className={`relative bg-[#f8fafc] overflow-hidden flex items-center justify-center ${
          isList ? "w-44 h-44 shrink-0 rounded-lg" : "w-full aspect-square"
        }`}
      >
        {product.comparePrice &&
          Number(product.comparePrice) > Number(product.price) && (
            <div className="absolute top-2.5 left-2.5 bg-[#00a3ff] text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm z-10">
              SALE
            </div>
          )}

        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full p-4"
        >
          <Image
            height={280}
            width={280}
            unoptimized
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          />
        </Link>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Title */}
          <h3 className="font-bold text-sm sm:text-[15px] text-slate-900 line-clamp-1 hover:text-[#00a3ff] transition-colors mb-1 font-sans">
            <Link href={`/product/${product.slug}`}>{product.name}</Link>
          </h3>

          {/* Specs / Badges */}
          {specs && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mb-1.5 font-medium">
              {specs}
            </p>
          )}

          {/* Stars & Reviews */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium ml-1">
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-black text-slate-900 text-base sm:text-lg">
              {CURRENCY}
              {Number(product.price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            {product.comparePrice &&
              Number(product.comparePrice) > Number(product.price) && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  {CURRENCY}
                  {Number(product.comparePrice).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() =>
            addItem({
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              stock: product.stock,
              image: imageUrl,
            })
          }
          className="w-full py-2 px-3 rounded-lg bg-[#060b13] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
