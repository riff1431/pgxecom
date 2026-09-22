"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface ShareBlogButtonProps {
  title: string;
  slug: string;
}

export function ShareBlogButton({ title, slug }: ShareBlogButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/blog/${slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Blog link copied");
    } catch {
      toast.error("Failed to copy blog link");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={handleShare}
      aria-label="Share blog"
      title="Share"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
