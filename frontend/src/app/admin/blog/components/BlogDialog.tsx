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
      <DialogContent className="sm:max-w-5xl rounded-2xl max-h-[90vh] overflow-y-auto bg-[#0b1322] border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white font-mono uppercase tracking-wider">
            {blog ? "Edit Blog" : "Write Blog"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Write and publish blog content with rich text, links, and images.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Title</Label>
            <Input
              placeholder="Write your blog title"
              {...register("title", { required: "Title is required" })}
              className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
            />
            {errors.title && (
              <p className="text-xs text-rose-400">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Excerpt</Label>
            <Textarea
              placeholder="Short summary for blog cards"
              rows={3}
              className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
              {...register("excerpt")}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Cover Image</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  await uploadCover(file);
                }}
                className="max-w-sm bg-[#080e18] border-slate-700 text-white"
              />

              {coverImage && (
                <Button
                  type="button"
                  variant="outline"
                  className="bg-[#080e18] border-slate-700 text-slate-300 hover:text-white"
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
                className="w-56 h-32 object-cover rounded-xl border border-slate-700"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Content</Label>
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
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Author Name</Label>
              <Input
                placeholder="Admin name"
                className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                {...register("authorName")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Tags (comma separated)</Label>
              <Input
                placeholder="health, nutrition, bangla"
                className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                {...register("tagsInput")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Meta Title</Label>
              <Input
                placeholder="SEO meta title"
                className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                {...register("metaTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 font-mono text-xs uppercase tracking-wider">Meta Description</Label>
              <Input
                placeholder="SEO meta description"
                className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                {...register("metaDesc")}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#080e18] p-4">
            <div>
              <p className="font-semibold text-white font-mono text-sm uppercase">Active / Published</p>
              <p className="text-sm text-slate-400">
                Inactive blogs stay hidden on storefront.
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={(next) => setValue("isPublished", next)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-[#080e18] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                uploadImageMutation.isPending
              }
              className="rounded-xl bg-[#00a3ff] hover:bg-[#008fe0] text-black font-semibold font-mono uppercase tracking-wider text-xs"
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
