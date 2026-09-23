import { MetadataRoute } from "next";
import { getBaseApiUrl } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const apiBaseUrl = getBaseApiUrl();

  try {
    const productsRes = await fetch(
      `${apiBaseUrl}/products?limit=1000`,
      { next: { revalidate: 3600 } }
    );
    const categoriesRes = await fetch(
      `${apiBaseUrl}/categories`,
      { next: { revalidate: 3600 } }
    );

    const productsJson = await productsRes.json();
    const products = productsJson?.data?.data || productsJson?.data || [];

    const categoriesJson = await categoriesRes.json();
    const categories = categoriesJson?.data?.data || categoriesJson?.data || [];

    const productUrls: MetadataRoute.Sitemap = products.map((product: any) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = categories.map((category: any) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(category.updatedAt || new Date()),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...productUrls,
      ...categoryUrls,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/shop`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}
