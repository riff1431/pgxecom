"use client";

import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateAdminBlogPost,
  useUpdateAdminBlogPost,
  useUploadAdminBlogImage,
} from "@/lib/api/blog";
import { resolveImageUrl } from "@/lib/utils";
import type { BlogFormValues, BlogPost, BlogUpsertPayload } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { BlogEditor } from "./BlogEditor";

interface BlogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: BlogPost | null;
}

const getDefaultValues = (blog: BlogPost | null): BlogFormValues => ({
  title: blog?.title || "",
  content: blog?.content || "<p></p>",
  excerpt: blog?.excerpt || "",
  coverImage: blog?.coverImage || "",
  authorName: blog?.authorName || "",
  tagsInput: blog?.tags?.join(", ") || "",
  metaTitle: blog?.metaTitle || "",
  metaDesc: blog?.metaDesc || "",
  isPublished: blog?.isPublished ?? false,
});

export function BlogDialog({ open, onOpenChange, blog }: BlogDialogProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateAdminBlogPost();
  const updateMutation = useUpdateAdminBlogPost();
  const uploadImageMutation = useUploadAdminBlogImage();

  const form = useForm<BlogFormValues>({
    defaultValues: getDefaultValues(blog),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const isPublished = watch("isPublished");
  const coverImage = watch("coverImage");
  const content = watch("content");

  useEffect(() => {
    reset(getDefaultValues(blog));
  }, [blog, reset, open]);

  const uploadCover = async (file: File) => {
    const uploaded = await uploadImageMutation.mutateAsync(file);
    setValue("coverImage", uploaded.url, { shouldDirty: true });
  };

  const uploadEditorImage = async (file: File) => {
    const uploaded = await uploadImageMutation.mutateAsync(file);
    return resolveImageUrl(uploaded.url);
  };

  const onSubmit = async (values: BlogFormValues) => {
    const tags =
      values.tagsInput
        ?.split(",")
        .map((tag) => tag.trim())
        .filter(Boolean) || [];

    const payload: BlogUpsertPayload = {
      id: blog?.id,
      title: values.title.trim(),
      content: values.content,
      excerpt: values.excerpt?.trim() || undefined,
      coverImage: values.coverImage?.trim() || undefined,
      authorName: values.authorName?.trim() || undefined,
      tags,
      metaTitle: values.metaTitle?.trim() || undefined,
      metaDesc: values.metaDesc?.trim() || undefined,
      isPublished: values.isPublished,
    };

    try {
      if (blog) {
        await updateMutation.mutateAsync(payload);
        toast.success("Blog updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Blog created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      onOpenChange(false);
      reset(getDefaultValues(null));
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Failed to save blog");
        return;
      }

      toast.error("Failed to save blog");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">
            {blog ? "Edit Blog" : "Write Blog"}
          </DialogTitle>
          <DialogDescription>
            Write and publish blog content with rich text, links, and images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Write your blog title"
              {...register("title", { required: "Title is required" })}
              className="rounded-xl"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Excerpt</Label>
            <Textarea
              placeholder="Short summary for blog cards"
              rows={3}
              className="rounded-xl"
              {...register("excerpt")}
            />
          </div>

          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  await uploadCover(file);
                }}
                className="max-w-sm"
              />

              {coverImage && (
                <Button
                  type="button"
                  onClick={() =>
                    setValue("coverImage", "", { shouldDirty: true })
                  }
                >
                  <X className="h-4 w-4 mr-2" /> Remove
                </Button>
              )}
            </div>

            {coverImage && (
              <img
                src={resolveImageUrl(coverImage)}
                alt="Blog cover"
                className="w-56 h-32 object-cover rounded-xl border"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <BlogEditor
              value={content}
              onChange={(nextValue) =>
                setValue("content", nextValue, { shouldDirty: true })
              }
              onUploadImage={uploadEditorImage}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input
                placeholder="Admin name"
                className="rounded-xl"
                {...register("authorName")}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags (comma separated)</Label>
              <Input
                placeholder="health, nutrition, bangla"
                className="rounded-xl"
                {...register("tagsInput")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                placeholder="SEO meta title"
                className="rounded-xl"
                {...register("metaTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Input
                placeholder="SEO meta description"
                className="rounded-xl"
                {...register("metaDesc")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
            <div>
              <p className="font-semibold text-gray-900">Active / Published</p>
              <p className="text-sm text-gray-500">
                Inactive blogs stay hidden on storefront.
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={(next) => setValue("isPublished", next)}
            />
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                uploadImageMutation.isPending
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : blog
                  ? "Update Blog"
                  : "Publish Blog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
