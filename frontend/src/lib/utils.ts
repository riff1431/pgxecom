import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || "";
  if (!base) return url;

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${normalizedPath}`;
}
