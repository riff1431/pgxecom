import { ArrowLeft, Calendar } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveImageUrl } from "@/lib/utils";
import Image from "next/image";
import { ShareBlogButton } from "./components/ShareBlogButton";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorName?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDesc?: string;
  createdAt: string;
}

interface BlogApiResponse {
  success: boolean;
  message?: string;
  data: BlogPost;
}

import { getBaseApiUrl } from "@/lib/api";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const baseUrl = getBaseApiUrl();
  const response = await fetch(
    `${baseUrl}/blog/details/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 60 },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch blog details");
  }

  const payload = (await response.json()) as BlogApiResponse;
  return payload.data;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found",
      description: "Requested blog post unavailable.",
    };
  }

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDesc || blog.excerpt || "Read this blog post.",
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDesc || blog.excerpt || "Read this blog post.",
      images: blog.coverImage ? [resolveImageUrl(blog.coverImage)] : [],
      type: "article",
      publishedTime: blog.publishedAt || blog.createdAt,
    },
  };
}

export default async function BlogDetailsPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center text-emerald-600 font-semibold"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to blog
        </Link>
        <ShareBlogButton title={blog.title} slug={blog.slug} />
      </div>

      {blog.coverImage && (
        <Image
          src={resolveImageUrl(blog.coverImage)}
          alt={blog.title}
          className="w-full rounded-2xl max-h-107.5 object-cover mb-8"
          width={1200}
          height={675}
          unoptimized
        />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="inline-flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {blog.publishedAt
            ? new Date(blog.publishedAt).toLocaleDateString()
            : new Date(blog.createdAt).toLocaleDateString()}
        </span>
        {blog.authorName && (
          <span className="text-sm text-gray-500">By {blog.authorName}</span>
        )}
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-5 leading-tight">
        {blog.title}
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {blog.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-semibold uppercase bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <article
        className="prose prose-lg max-w-none prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
}
