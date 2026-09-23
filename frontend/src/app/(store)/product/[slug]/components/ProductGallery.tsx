"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { resolveImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = useMemo(() => {
    return (product.images || []).map((image) => ({
      id: image.id,
      alt: image.alt || product.name,
      url: resolveImageUrl(image.url),
    }));
  }, [product.images, product.name]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div className="w-full md:w-1/2 space-y-4">
      <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center text-gray-400">
        {activeImage ? (
          <Image
            fill
            src={activeImage.url}
            alt={activeImage.alt}
            className="w-full h-full object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
          />
        ) : (
          "Product Image"
        )}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${activeIndex === index
                ? "border-[#00a3ff] shadow-md shadow-[#00a3ff]/20"
                : "border-transparent hover:border-gray-300"
                }`}
              aria-label={`Show image ${index + 1}`}
            >
              <Image
                fill
                src={image.url}
                alt={image.alt}
                className="object-cover"
                sizes="120px"
                unoptimized
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
