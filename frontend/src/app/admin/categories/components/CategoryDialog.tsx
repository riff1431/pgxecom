"use client";

import { Cascader } from "@/components/cascader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  findCategoryPathById,
  useCategoryTree,
  useCreateCategory,
  useUpdateCategory,
} from "@/lib/api/category";
import type { Category } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  sortOrder: z.coerce.number(),
  parentPath: z.array(z.string()).default([]),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
}: CategoryDialogProps) {
  const queryClient = useQueryClient();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { data: categoryTreeData } = useCategoryTree({
    admin: true,
    excludeId: category?.id,
  });

  const tree = useMemo(
    () => categoryTreeData?.tree ?? [],
    [categoryTreeData?.tree],
  );
  const parentOptions = useMemo(
    () => categoryTreeData?.options ?? [],
    [categoryTreeData?.options],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      parentPath: [],
    },
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        sortOrder: category.sortOrder || 0,
        parentPath: [],
      });
    } else {
      reset({
        name: "",
        slug: "",
        description: "",
        sortOrder: 0,
        parentPath: [],
      });
    }
  }, [category, reset, open]);

  useEffect(() => {
    if (!category?.parentId) {
      setValue("parentPath", []);
      return;
    }

    const path = findCategoryPathById(tree, category.parentId);
    setValue("parentPath", path);
  }, [category?.parentId, setValue, tree]);

  const onSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    const parentId =
      values.parentPath.length > 0
        ? values.parentPath[values.parentPath.length - 1]
        : null;
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      sortOrder: values.sortOrder,
      parentId,
    };

    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, data: payload });
        toast.success("Category updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Category created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      onOpenChange(false);
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
        return;
      }
      toast.error("Something went wrong");
    }
  };

  const name = watch("name");
  useEffect(() => {
    if (!category && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [name, setValue, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-[#0b1322] border-slate-800 text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white font-mono uppercase tracking-wider">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="name" className="text-slate-300 font-mono text-xs uppercase tracking-wider">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Electronics"
              className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-rose-400 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="slug" className="text-slate-300 font-mono text-xs uppercase tracking-wider">
              Slug
            </Label>
            <Input
              id="slug"
              placeholder="electronics"
              className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500 font-mono text-xs"
              {...register("slug")}
            />
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1">
              Used in URL: /category/electronics
            </div>
            {errors.slug && (
              <p className="text-xs text-rose-400 font-medium">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="parent-category" className="text-slate-300 font-mono text-xs uppercase tracking-wider">
              Parent Category
            </Label>
            <Cascader
              options={parentOptions}
              value={watch("parentPath")}
              onChange={(path) =>
                setValue("parentPath", path, { shouldDirty: true })
              }
              placeholder="Optional: select parent category"
              className="w-full h-11 rounded-xl bg-[#080e18] border-slate-700 text-white"
              allowClear
              changeOnSelect
              expandTrigger="hover"
            />
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-1">
              Leave empty to keep this category at root level.
            </p>
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="description" className="text-slate-300 font-mono text-xs uppercase tracking-wider">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief category description..."
              className="min-h-24 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="sortOrder" className="text-slate-300 font-mono text-xs uppercase tracking-wider">
              Sort Order
            </Label>
            <Input
              id="sortOrder"
              type="number"
              className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white"
              {...register("sortOrder")}
            />
            {errors.sortOrder && (
              <p className="text-xs text-rose-400 font-medium">
                {errors.sortOrder.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-11 rounded-xl bg-[#080e18] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-[#00a3ff] hover:bg-[#008fe0] text-black font-semibold font-mono uppercase tracking-wider text-xs rounded-xl"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : category ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
