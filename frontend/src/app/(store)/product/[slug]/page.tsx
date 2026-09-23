import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductDetailClient } from "./components/ProductDetailClient";
import type { Product, Setting } from "@/types";
import { Metadata, ResolvingMetadata } from "next";

import { getBaseApiUrl } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  const baseUrl = getBaseApiUrl();
  try {
    const url = `${baseUrl}/products/${slug}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.warn(`[getProduct] Fetch failed for ${url} - Status: ${res.status} ${res.statusText}`);
      return null;
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error(`[getProduct] Network error fetching ${baseUrl}/products/${slug}:`, error);
    return null;
  }
}

async function getSettings(): Promise<Record<string, string>> {
  const baseUrl = getBaseApiUrl();
  try {
    const res = await fetch(`${baseUrl}/settings`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const settingsArr: Setting[] = json.data || [];
    const settingsMap: Record<string, string> = {};
    settingsArr.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return settingsMap;
  } catch (error) {
    console.error(`[getSettings] Network error fetching ${baseUrl}/settings:`, error);
    return {};
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProduct(slug), getSettings()]);

  const storeName = settings["store_name"] || process.env.NEXT_PUBLIC_STORE_NAME || "FreshMart";
  const defaultDesc = settings["store_description"] || `Fresh and organic products at ${storeName}`;

  if (!product) {
    return { title: `Product Not Found | ${storeName}` };
  }

  return {
    title: `${product.name} | ${storeName}`,
    description: product.shortDesc || product.description || defaultDesc,
    openGraph: {
      title: `${product.name} | ${storeName}`,
      description: product.shortDesc || product.description || "",
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images?.[0]?.url || "",
    description: product.shortDesc || product.description || "",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "BDT",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/shop" className="hover:text-emerald-600">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
