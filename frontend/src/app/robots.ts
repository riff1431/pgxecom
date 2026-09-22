import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/product/", "/category/"],
      disallow: ["/cart", "/checkout", "/orders", "/admin"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
