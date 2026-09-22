import { permanentRedirect } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // SEO-friendly server-side 301 redirect to the shop page with category filter applied
  permanentRedirect(`/shop?category=${slug}`);
}
