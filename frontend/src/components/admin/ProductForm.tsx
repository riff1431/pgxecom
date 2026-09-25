"use client";

import { BlogEditor } from "@/app/admin/blog/components/BlogEditor";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api as instance } from "@/lib/api";
import { useGetCategories } from "@/lib/api/category";
import { useCreateProduct, useUpdateProduct } from "@/lib/api/product";
import { CURRENCY } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/utils";
import {
  CreateProductFormInput,
  CreateProductInput,
  createProductSchema,
} from "@/schemas/product.schema";
import type { Category, Product, ProductImage } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  ArrowLeft,
  DollarSign,
  Globe,
  ImageIcon,
  Info,
  Layers,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: Product | null;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const isEditing = Boolean(initialData && productId);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormInput, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          slug: initialData.slug || "",
          namebn: initialData.namebn || "",
          shortDesc: initialData.shortDesc || "",
          description: initialData.description || "",
          categoryId: initialData.categoryId || "",
          price: Number(initialData.price) || 0,
          comparePrice: initialData.comparePrice ? Number(initialData.comparePrice) : null,
          costPrice: initialData.costPrice ? Number(initialData.costPrice) : null,
          stock: initialData.stock ?? 0,
          lowStockAlert: initialData.lowStockAlert ?? 5,
          weight: initialData.weight || "",
          sku: initialData.sku || "",
          isActive: initialData.isActive ?? true,
          isFeatured: initialData.isFeatured ?? false,
          isHot: initialData.isHot ?? false,
          metaTitle: initialData.metaTitle || "",
          metaDesc: initialData.metaDesc || "",
          images:
            initialData.images?.map((img: ProductImage | string) =>
              typeof img === "string" ? img : img.url,
            ) || [],
          variants:
            initialData.variants?.map((v) => ({
              name: v.name,
              price: Number(v.price) || 0,
              comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
              stock: v.stock ?? 0,
            })) || [],
        }
      : {
          name: "",
          slug: "",
          namebn: "",
          shortDesc: "",
          description: "",
          categoryId: "",
          price: 0,
          comparePrice: null,
          costPrice: null,
          stock: 0,
          lowStockAlert: 5,
          weight: "",
          sku: "",
          isActive: true,
          isFeatured: false,
          isHot: false,
          metaTitle: "",
          metaDesc: "",
          images: [],
          variants: [],
        },
  });

  const {
    fields: variants,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "variants",
  });

  // Sync form values when initialData updates (e.g. cache refetch, image updates)
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        namebn: initialData.namebn || "",
        shortDesc: initialData.shortDesc || "",
        description: initialData.description || "",
        categoryId: initialData.categoryId || "",
        price: Number(initialData.price) || 0,
        comparePrice: initialData.comparePrice ? Number(initialData.comparePrice) : null,
        costPrice: initialData.costPrice ? Number(initialData.costPrice) : null,
        stock: initialData.stock ?? 0,
        lowStockAlert: initialData.lowStockAlert ?? 5,
        weight: initialData.weight || "",
        sku: initialData.sku || "",
        isActive: initialData.isActive ?? true,
        isFeatured: initialData.isFeatured ?? false,
        isHot: initialData.isHot ?? false,
        metaTitle: initialData.metaTitle || "",
        metaDesc: initialData.metaDesc || "",
        images:
          initialData.images?.map((img: ProductImage | string) =>
            typeof img === "string" ? img : img.url,
          ) || [],
        variants:
          initialData.variants?.map((v) => ({
            name: v.name,
            price: Number(v.price) || 0,
            comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
            stock: v.stock ?? 0,
          })) || [],
      });
    }
  }, [initialData, reset]);

  // Automatically derive URL-friendly slug from name when adding new product
  const productName = watch("name");
  useEffect(() => {
    if (!isEditing && productName) {
      const generatedSlug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [productName, setValue, isEditing]);

  // Keep total stock in sync with variants sum if variants exist
  const watchedVariants = watch("variants");
  useEffect(() => {
    if (watchedVariants && watchedVariants.length > 0) {
      const sum = watchedVariants.reduce((total, v) => total + (Number(v.stock) || 0), 0);
      setValue("stock", sum, { shouldValidate: true });
    }
  }, [watchedVariants, setValue]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      setIsUploadingImages(true);
      const rawImages = data.images ?? [];

      // Upload any new File objects to /admin/upload
      const uploadedImageUrls: string[] = [];
      for (const item of rawImages) {
        if (typeof item === "string") {
          uploadedImageUrls.push(item);
        } else if (typeof File !== "undefined" && item instanceof File) {
          const uploadData = new FormData();
          uploadData.append("file", item);
          const uploadRes = await instance.post("/admin/upload", uploadData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const url = uploadRes.data?.data?.url;
          if (url) {
            uploadedImageUrls.push(url);
          }
        }
      }
      setIsUploadingImages(false);

      // Construct clean JSON payload matching Prisma Schema exactly
      const payload: Record<string, any> = {
        name: data.name.trim(),
        slug: data.slug.trim(),
        categoryId: data.categoryId,
        price: Number(data.price),
        stock: Number(data.stock),
        lowStockAlert: Number(data.lowStockAlert),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isHot: data.isHot,
      };

      if (data.namebn && data.namebn.trim()) payload.namebn = data.namebn.trim();
      if (data.shortDesc && data.shortDesc.trim()) payload.shortDesc = data.shortDesc.trim();
      if (data.description && data.description.trim()) payload.description = data.description.trim();
      if (data.sku && data.sku.trim()) payload.sku = data.sku.trim();
      if (data.comparePrice !== undefined && data.comparePrice !== null) {
        payload.comparePrice = Number(data.comparePrice);
      }
      if (data.costPrice !== undefined && data.costPrice !== null) {
        payload.costPrice = Number(data.costPrice);
      }
      if (data.weight && data.weight.trim()) payload.weight = data.weight.trim();
      if (data.metaTitle && data.metaTitle.trim()) payload.metaTitle = data.metaTitle.trim();
      if (data.metaDesc && data.metaDesc.trim()) payload.metaDesc = data.metaDesc.trim();

      // Images formatted as { url, sortOrder }
      payload.images = uploadedImageUrls.map((url, index) => ({
        url,
        sortOrder: index,
      }));

      // Variants
      if (data.variants && data.variants.length > 0) {
        payload.variants = data.variants.map((v) => ({
          name: v.name.trim(),
          price: Number(v.price),
          comparePrice: v.comparePrice !== undefined && v.comparePrice !== null ? Number(v.comparePrice) : undefined,
          stock: Number(v.stock),
        }));
      } else {
        payload.variants = [];
      }

      if (isEditing && productId) {
        await updateProductMutation.mutateAsync({ id: productId, data: payload });
        toast.success("Product updated successfully!");
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success("Product created successfully!");
      }

      router.push("/admin/products");
    } catch (error: unknown) {
      setIsUploadingImages(false);
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Failed to save product");
        return;
      }
      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }
      toast.error("Failed to save product");
    }
  };

  const isSaving =
    isSubmitting ||
    isUploadingImages ||
    createProductMutation.isPending ||
    updateProductMutation.isPending;

  const categoryOptions =
    (categories as Category[] | undefined)?.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })) || [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        const errorKeys = Object.keys(formErrors);
        if (errorKeys.length > 0) {
          const firstError = formErrors[errorKeys[0] as keyof typeof formErrors];
          const msg = firstError?.message || "Please fix validation errors.";
          toast.error(String(msg));
        }
      })}
      className="space-y-8 pb-28"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2.5">
              <Info className="h-4 w-4 text-primary" />
              <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Basic Information
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="product-name" className="font-mono text-xs uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Product Title <span className="text-destructive">*</span></span>
                  <span className="text-[10px] text-muted-foreground font-normal lowercase">required</span>
                </Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  {...register("name")}
                  className={`h-11 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-slug" className="font-mono text-xs uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span>URL Slug <span className="text-destructive">*</span></span>
                    <span className="text-[10px] text-primary font-mono">/product/{watch("slug") || "..."}</span>
                  </Label>
                  <Input
                    id="product-slug"
                    placeholder="wireless-headphones"
                    {...register("slug")}
                    className={`h-11 rounded-lg bg-background border-border text-foreground font-mono text-xs placeholder:text-muted-foreground focus:border-primary ${errors.slug ? "border-destructive" : ""}`}
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive font-medium">{errors.slug.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-sku" className="font-mono text-xs uppercase tracking-wider text-foreground">
                    SKU Code
                  </Label>
                  <Input
                    id="product-sku"
                    placeholder="WNC-BLK-01"
                    {...register("sku")}
                    className="h-11 rounded-lg bg-background border-border text-foreground font-mono text-xs placeholder:text-muted-foreground focus:border-primary"
                  />
                  {errors.sku && (
                    <p className="text-xs text-destructive font-medium">{errors.sku.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-short-desc" className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Short Summary / Highlight
                </Label>
                <Textarea
                  id="product-short-desc"
                  placeholder="Key highlight or 1-2 sentence quick summary shown on product card..."
                  rows={2}
                  {...register("shortDesc")}
                  className="rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                {errors.shortDesc && (
                  <p className="text-xs text-destructive font-medium">{errors.shortDesc.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Full Rich Description
                </Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <BlogEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      onUploadImage={async (file) => {
                        const uploadFormData = new FormData();
                        uploadFormData.append("file", file);
                        const response = await instance.post("/admin/upload", uploadFormData, {
                          headers: { "Content-Type": "multipart/form-data" },
                        });
                        return resolveImageUrl(response.data.data.url);
                      }}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-destructive font-medium">{errors.description.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Card: Media & Images */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                  Media & Gallery
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground">
                {watch("images")?.length || 0} / 8 uploaded
              </span>
            </div>
            <div className="p-6">
              <ImageUpload
                value={watch("images") || []}
                onChange={(urls) => setValue("images", urls, { shouldValidate: true })}
                onRemove={(val) => {
                  const current = getValues("images") || [];
                  setValue(
                    "images",
                    current.filter((u) => u !== val),
                    { shouldValidate: true },
                  );
                }}
                maxFiles={8}
              />
              {errors.images && (
                <p className="text-xs text-destructive font-medium mt-2">{errors.images.message}</p>
              )}
            </div>
          </div>

          {/* Card: Variants (Options) */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                  Product Variants (Optional)
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    name: "",
                    price: Number(watch("price")) || 0,
                    comparePrice: watch("comparePrice") ? Number(watch("comparePrice")) : null,
                    stock: 0,
                  })
                }
                className="h-8 rounded-lg font-mono text-xs uppercase bg-background border-border text-foreground hover:bg-muted"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-primary" /> Add Variant
              </Button>
            </div>
            <div className="p-6">
              {variants.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">
                    No variants added
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use variants if this product has options like sizes (S, M, L) or weights (500g, 1kg).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-3 px-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    <span className="col-span-5">Variant Title</span>
                    <span className="col-span-3">Price ({CURRENCY})</span>
                    <span className="col-span-3">Stock Units</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>

                  {variants.map((v, index) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 items-center border border-border rounded-lg bg-background hover:border-primary/40 transition-colors"
                    >
                      <div className="md:col-span-5">
                        <Input
                          placeholder="e.g. 500g or XL"
                          {...register(`variants.${index}.name`)}
                          className="h-9 rounded-lg bg-background border-border text-foreground font-mono text-xs placeholder:text-muted-foreground"
                        />
                        {errors.variants?.[index]?.name && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.variants[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          {...register(`variants.${index}.price`)}
                          className="h-9 rounded-lg bg-background border-border text-foreground font-mono text-xs"
                        />
                        {errors.variants?.[index]?.price && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.variants[index]?.price?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-3">
                        <Input
                          type="number"
                          placeholder="Stock"
                          {...register(`variants.${index}.stock`)}
                          className="h-9 rounded-lg bg-background border-border text-foreground font-mono text-xs"
                        />
                        {errors.variants?.[index]?.stock && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.variants[index]?.stock?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <p className="text-[11px] font-mono text-muted-foreground mt-2 px-1">
                    Note: When variants are defined, total product inventory will match the combined sum of all variant stocks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column (1 span) */}
        <div className="space-y-6">
          {/* Card: Status & Visibility */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2.5">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Organization & Status
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>Category <span className="text-destructive">*</span></span>
                  {isCategoriesLoading && (
                    <span className="text-[10px] text-muted-foreground">loading...</span>
                  )}
                </Label>
                <Combobox
                  options={categoryOptions}
                  value={watch("categoryId")}
                  onValueChange={(val) => setValue("categoryId", val || "", { shouldValidate: true })}
                  placeholder="Select a category"
                  searchPlaceholder="Search category..."
                  triggerClassName={`w-full h-11 bg-background border-border text-foreground rounded-lg ${errors.categoryId ? "border-destructive" : ""}`}
                />
                {errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                      Publish to Store
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Product is visible to buyers
                    </p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                      Featured
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Show in featured showcases
                    </p>
                  </div>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                      Hot / Trending
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Highlight with hot badge
                    </p>
                  </div>
                  <Controller
                    name="isHot"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Pricing & Stock */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2.5">
              <DollarSign className="h-4 w-4 text-primary" />
              <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                Pricing & Inventory
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-price" className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Sale Price ({CURRENCY}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                    {CURRENCY}
                  </span>
                  <Input
                    id="product-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("price")}
                    className={`h-11 rounded-lg bg-background border-border text-foreground font-mono pl-9 ${errors.price ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-destructive font-medium">{errors.price.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="product-compare-price" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Compare Price
                  </Label>
                  <Input
                    id="product-compare-price"
                    type="number"
                    step="0.01"
                    placeholder="Original"
                    {...register("comparePrice")}
                    className="h-10 rounded-lg bg-background border-border text-foreground font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-cost-price" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Cost Price
                  </Label>
                  <Input
                    id="product-cost-price"
                    type="number"
                    step="0.01"
                    placeholder="Your cost"
                    {...register("costPrice")}
                    className="h-10 rounded-lg bg-background border-border text-foreground font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="product-stock" className="font-mono text-xs uppercase tracking-wider text-foreground">
                    Total Stock <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="product-stock"
                    type="number"
                    disabled={variants.length > 0}
                    placeholder="0"
                    {...register("stock")}
                    className={`h-10 rounded-lg bg-background border-border text-foreground font-mono text-xs ${errors.stock ? "border-destructive" : ""}`}
                  />
                  {errors.stock && (
                    <p className="text-[10px] text-destructive font-medium">{errors.stock.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-low-stock" className="font-mono text-xs uppercase tracking-wider text-amber-500">
                    Low Stock Alert
                  </Label>
                  <Input
                    id="product-low-stock"
                    type="number"
                    placeholder="5"
                    {...register("lowStockAlert")}
                    className="h-10 rounded-lg bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="product-weight" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Weight / Dimensions
                </Label>
                <Input
                  id="product-weight"
                  placeholder="e.g. 500g or 1.2kg"
                  {...register("weight")}
                  className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Card: Search Engine Optimization */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-primary" />
              <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">
                SEO Metadata
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta-title" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Meta Title
                </Label>
                <Input
                  id="meta-title"
                  placeholder="SEO meta title"
                  {...register("metaTitle")}
                  className="h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-desc" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Meta Description
                </Label>
                <Textarea
                  id="meta-desc"
                  placeholder="Search engine preview text..."
                  rows={3}
                  {...register("metaDesc")}
                  className="rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-3.5 px-6 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-between z-40 shadow-lg">
        <Button
          type="button"
          variant="outline"
          asChild
          className="h-11 px-5 rounded-lg border-border bg-background text-foreground hover:bg-muted font-mono text-xs uppercase tracking-wider"
        >
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold font-mono text-xs uppercase tracking-wider shadow-xs transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Product...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Product" : "Publish Product"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
