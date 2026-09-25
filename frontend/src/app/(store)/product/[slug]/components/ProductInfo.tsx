"use client";

import { Minus, Plus, ShoppingCart, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CURRENCY } from "@/lib/constants";

interface ProductInfoProps {
  product: any;
  activePrice: number;
  selectedVariant: string | null;
  setSelectedVariant: (id: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  handleAdd: () => void;
}

export function ProductInfo({
  product,
  activePrice,
  selectedVariant,
  setSelectedVariant,
  quantity,
  setQuantity,
  handleAdd,
}: ProductInfoProps) {
  const activeStock = selectedVariant
    ? product.variants?.find((v: any) => v.id === selectedVariant)?.stock || 0
    : product.stock || 0;

  const isOutOfStock = activeStock <= 0;

  return (
    <div className="w-full md:w-1/2 flex flex-col pt-4">
      <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2 font-mono">{product.name}</h1>
      <p className="text-2xl text-foreground font-black mb-4 font-mono">{CURRENCY}{Number(activePrice).toFixed(2)}</p>

      <div
        className="text-muted-foreground mb-6 prose-sm max-w-none font-sans"
        dangerouslySetInnerHTML={{ __html: product.shortDesc || "No description provided." }}
      />

      {product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Options / Variants</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-4 py-2 border rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${selectedVariant === v.id ? "bg-primary text-primary-foreground border-primary shadow-xs" : "border-border hover:bg-muted text-foreground"
                  }`}
              >
                {v.name}
              </button>
            ))}
          </div>
          {isOutOfStock && selectedVariant && (
            <p className="text-destructive text-xs mt-2 font-medium">Out of stock for this selection.</p>
          )}
        </div>
      )}

      {(!product.variants || product.variants.length === 0) && isOutOfStock && (
        <p className="text-destructive text-xs mb-4 font-medium">Currently out of stock.</p>
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center border border-border rounded-lg overflow-hidden h-12 bg-background">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 hover:bg-muted text-muted-foreground h-full transition-colors">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-bold text-foreground">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-4 hover:bg-muted text-muted-foreground h-full transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          onClick={handleAdd}
          disabled={(product.variants && product.variants.length > 0 && !selectedVariant) || isOutOfStock}
          className="h-12 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider rounded-lg disabled:opacity-50 shadow-xs"
        >
          <ShoppingCart className="mr-2 h-4 w-4" /> {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>

      <div className="border-t border-border pt-6 space-y-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <Truck className="h-4 w-4 text-primary" />
          <span>Worldwide express courier delivery</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Commercial grade build & 2-year warranty</span>
        </div>
      </div>
    </div>
  );
}
