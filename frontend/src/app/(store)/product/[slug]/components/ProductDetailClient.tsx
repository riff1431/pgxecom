"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

export function ProductDetailClient({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants?.length ? product.variants[0].id : null
  );

  const activePrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.price ||
    product.price
    : product.price;

  const handleAdd = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error("Please select a variant to order this product.");
      return;
    }

    const imageUrl = resolveImageUrl(product.images?.[0]?.url);

    const selectedVariantData = selectedVariant 
      ? product.variants?.find((v: any) => v.id === selectedVariant) 
      : null;

    addItem({
      productId: product.id,
      name: product.name,
      price: activePrice,
      quantity,
      stock: selectedVariantData ? selectedVariantData.stock : product.stock,
      variantId: selectedVariant || undefined,
      image: imageUrl as string,
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col md:flex-row gap-10">
        <ProductGallery product={product} />

        <ProductInfo
          product={product}
          activePrice={activePrice}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAdd={handleAdd}
        />
      </div>

      {product.description && (
        <div className="mt-8 border-t pt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h2>
          <article
            className="prose prose-lg max-w-none prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
}
