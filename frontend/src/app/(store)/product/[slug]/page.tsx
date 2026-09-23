"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Loader2, ShieldAlert } from "lucide-react";
import { ProductDetailClient } from "./components/ProductDetailClient";
import { useGetProduct } from "@/lib/api/product";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useGetProduct(slug);

  if (isLoading) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#00a3ff] mb-4" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest font-bold">
          Loading Product Details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-mono mb-2">
          Product Not Found
        </h1>
        <p className="text-slate-500 text-sm max-w-md mb-6">
          The fitness gear or equipment you are looking for is currently unavailable or the link may have expired.
        </p>
        <Link
          href="/shop"
          className="h-11 px-8 rounded-lg bg-[#060b13] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="container mx-auto px-4 py-3 flex items-center text-xs sm:text-sm text-slate-500">
          <Link href="/" className="hover:text-[#00a3ff] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300" />
          <Link href="/shop" className="hover:text-[#00a3ff] transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300" />
          <span className="text-slate-900 truncate font-semibold">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
