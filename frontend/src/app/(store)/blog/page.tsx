"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useGetBlogPosts } from "@/lib/api/blog";
import { resolveImageUrl } from "@/lib/utils";
import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BlogPage() {
  const { data: blogData, isLoading } = useGetBlogPosts();

  const posts = blogData?.data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
        <p className="text-gray-500">
          Read our latest health tips, recipes, and company news.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border">
          <p className="text-xl text-gray-500">No blog posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                  {post.coverImage ? (
                    <Image
                      src={resolveImageUrl(post.coverImage)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      width={500}
                      height={300}
                      unoptimized
                    />
                  ) : (
                    "Cover Image"
                  )}
                </div>
              </Link>
              <div className="p-6">
                <div className="flex gap-2 mb-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-xs text-gray-400 gap-1 mt-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
