"use client";

import { BlogEditor } from "@/app/admin/blog/components/BlogEditor";
import { api as instance } from "@/lib/api";
import { resolveImageUrl } from "@/lib/utils";

import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useGetCategories } from "@/lib/api/category";
import { useCreateProduct, useUpdateProduct } from "@/lib/api/product";
import {
  CreateProductFormInput,
  CreateProductInput,
  createProductSchema,
} from "@/schemas/product.schema";
import type { Category, ProductImage } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  BadgeDollarSign,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Loader2,
  Plus,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductFormProps {
  initialData?: Partial<Omit<CreateProductInput, "images">> & {
    images?: Array<ProductImage | string>;
  };
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const { data: categories } = useGetCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isEditing = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateProductFormInput, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          categoryId: initialData.categoryId || "",
          images:
            initialData.images?.map((img) =>
              typeof img === "string" ? img : img.url,
            ) || [],
        }
      : {
          name: "",
          slug: "",
          namebn: "",
          description: "",
          shortDesc: "",
          sku: "",
          price: 0,
          comparePrice: 0,
          costPrice: 0,
          stock: 0,
          lowStockAlert: 5,
          weight: "",
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

  const productName = watch("name");
  useEffect(() => {
    if (!isEditing && productName) {
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [productName, setValue, isEditing]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const formData = new FormData();
      const imageItems = data.images ?? [];

      // Separate files from existing URLs
      const existingImages = imageItems.filter(
        (item): item is string => typeof item === "string",
      );
      const newFiles = imageItems.filter(
        (item): item is File =>
          typeof File !== "undefined" && item instanceof File,
      );

      // Clean payload for JSON part
      const jsonPayload = {
        ...data,
        images: existingImages.map((url: string) => ({ url })),
      };

      formData.append("data", JSON.stringify(jsonPayload));
      newFiles.forEach((file: File) => {
        formData.append("images", file);
      });

      if (isEditing && productId) {
        await updateProduct.mutateAsync({ id: productId, data: formData });
        toast.success("Product updated successfully!");
      } else {
        await createProduct.mutateAsync(formData);
        toast.success("Product created successfully!");
      }
      reset();
      router.push("/admin/products");
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
        return;
      }

      toast.error("Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (err) => {
        console.error("Form Errors:", err);
        toast.error("Please fix the errors in the form before submitting.");
      })}
      className="space-y-8 pb-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18]">
              <CardTitle className="flex items-center gap-2 text-xl font-bold font-mono uppercase tracking-wider text-white">
                <Info className="h-5 w-5 text-[#00a3ff]" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  Product Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="Sundarbans Pure Honey"
                  {...register("name")}
                  className={`h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500 ${errors.name ? "border-rose-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  Product Slug{" "}
                  <span className="text-[#00a3ff] text-[10px] font-mono font-bold uppercase tracking-widest">
                    URL Handle
                  </span>
                </Label>
                <Input
                  placeholder="sundarbans-pure-honey"
                  {...register("slug")}
                  className={`h-11 rounded-xl bg-[#080e18] border-slate-700 text-white font-mono text-xs placeholder:text-slate-500 ${errors.slug ? "border-rose-500" : ""}`}
                />
                {errors.slug && (
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest px-1">
                  Permanent link to your product
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Short Subtitle / Specs</Label>
                  <Input
                    placeholder="e.g. Smart • Foldable • 22km/h"
                    {...register("shortDesc")}
                    className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.shortDesc?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">SKU (Stock Keeping Unit)</Label>
                  <Input
                    placeholder="PGX-TRD-01"
                    {...register("sku")}
                    className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500 font-mono"
                  />
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.sku?.message}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Short Description</Label>
                <Textarea
                  placeholder="Quick overview of the product..."
                  {...register("shortDesc")}
                  rows={2}
                  className="rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-rose-400 font-medium">
                  {errors.shortDesc?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Full Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <BlogEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      onUploadImage={async (file) => {
                        const formData = new FormData();
                        formData.append("file", file);
                        const response = await instance.post(
                          "/admin/upload",
                          formData,
                          {
                            headers: { "Content-Type": "multipart/form-data" },
                          }
                        );
                        return resolveImageUrl(response.data.data.url);
                      }}
                    />
                  )}
                />
                <p className="text-xs text-rose-400 font-medium">
                  {errors.description?.message}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18]">
              <CardTitle className="flex items-center gap-2 text-xl font-bold font-mono uppercase tracking-wider text-white">
                <ImageIcon className="h-5 w-5 text-[#00a3ff]" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ImageUpload
                value={watch("images") || []}
                onChange={(urls) => setValue("images", urls)}
                onRemove={(val) => {
                  const current = getValues("images") || [];
                  setValue(
                    "images",
                    current.filter((u) => u !== val),
                  );
                }}
                maxFiles={5}
              />
              <p className="text-xs text-rose-400 font-medium">
                {errors.images?.message}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18] flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold font-mono uppercase tracking-wider text-white">
                <LayoutGrid className="h-5 w-5 text-[#00a3ff]" />
                Variants (Options)
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", price: 0, stock: 0 })}
                className="rounded-lg font-mono text-xs uppercase bg-[#080e18] border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {variants.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-[#080e18]/40">
                  <p className="text-sm text-slate-500 font-mono uppercase tracking-widest">
                    No variants added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, index) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-end border border-slate-800 rounded-2xl bg-[#080e18]"
                    >
                      <div className="md:col-span-5 space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                          Option Name (e.g. 500g)
                        </Label>
                        <Input
                          {...register(`variants.${index}.name`)}
                          className="h-10 rounded-lg bg-[#060b13] border-slate-700 text-white"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                          Price
                        </Label>
                        <Input
                          type="number"
                          {...register(`variants.${index}.price`)}
                          className="h-10 rounded-lg bg-[#060b13] border-slate-700 text-white"
                        />
                        <p className="text-xs text-rose-400 font-medium">
                          {errors.variants?.[index]?.price?.message}
                        </p>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                          Stock
                        </Label>
                        <Input
                          type="number"
                          {...register(`variants.${index}.stock`)}
                          className="h-10 rounded-lg bg-[#060b13] border-slate-700 text-white"
                        />
                        <p className="text-xs text-rose-400 font-medium">
                          {errors.variants?.[index]?.stock?.message}
                        </p>
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-10 w-10 flex shrink-0"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18]">
              <CardTitle className="flex items-center gap-2 text-lg font-bold font-mono uppercase tracking-wider text-white">
                <Settings className="h-4 w-4 text-[#00a3ff]" />
                Visibility & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Combobox
                  options={
                    (categories as Category[] | undefined)?.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                    })) || []
                  }
                  value={watch("categoryId")}
                  onValueChange={(val) =>
                    setValue("categoryId", val, { shouldValidate: true })
                  }
                  placeholder="Select a category"
                  searchPlaceholder="Search category..."
                  triggerClassName={`bg-[#080e18] border-slate-700 text-white ${errors.categoryId ? "border-rose-500" : ""}`}
                />
                {errors.categoryId && (
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">
                    Publish to Store
                  </Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#00a3ff]"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">
                    Featured Product
                  </Label>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#00a3ff]"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Mark as Hot</Label>
                  <Controller
                    name="isHot"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-[#00a3ff]"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18]">
              <CardTitle className="flex items-center gap-2 text-lg font-bold font-mono uppercase tracking-wider text-white">
                <BadgeDollarSign className="h-4 w-4 text-[#00a3ff]" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 border-b pb-6 border-slate-800">
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Default Sale Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      €
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price")}
                      className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white pl-8"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-rose-400 font-medium">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Compare at Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      €
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("comparePrice")}
                      className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-b pb-6 border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Cost per Item</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                        €
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("costPrice")}
                        className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                      Weight (g/kg)
                    </Label>
                    <Input
                      placeholder="500g"
                      {...register("weight")}
                      className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                    />
                    {errors.weight && (
                      <p className="text-xs text-rose-400 font-medium">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-wider text-slate-300">Total Stock</Label>
                    <Input
                      type="number"
                      {...register("stock")}
                      className="h-11 rounded-xl bg-[#080e18] border-slate-700 text-white"
                    />
                    {errors.stock && (
                      <p className="text-xs text-rose-400 font-medium">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs uppercase tracking-wider text-amber-400">
                      Low Stock Alert
                    </Label>
                    <Input
                      type="number"
                      {...register("lowStockAlert")}
                      className="h-11 rounded-xl border-amber-500/20 bg-amber-500/10 text-amber-200"
                    />
                    {errors.lowStockAlert && (
                      <p className="text-xs text-rose-400 font-medium">
                        {errors.lowStockAlert.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0b1322] border-slate-800 shadow-sm overflow-hidden text-white">
            <CardHeader className="border-b border-slate-800 bg-[#080e18]">
              <CardTitle className="flex items-center gap-2 text-lg font-bold font-mono uppercase tracking-wider text-white">
                <Info className="h-4 w-4 text-[#00a3ff]" />
                SEO Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  Meta Title
                </Label>
                <Input
                  placeholder="Best Organic Honey in BD"
                  {...register("metaTitle")}
                  className="h-10 rounded-lg bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase tracking-wider text-slate-400">
                  Meta Description
                </Label>
                <Textarea
                  placeholder="Buy 100% pure organic honey harvested from Sundarbans..."
                  {...register("metaDesc")}
                  rows={3}
                  className="rounded-lg bg-[#080e18] border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#080e18]/90 backdrop-blur-md border-t border-slate-800 flex justify-end gap-3 z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.5)]">
        <div className="container flex justify-end gap-3 px-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-11 rounded-xl font-mono text-xs uppercase tracking-wider px-8 border-slate-700 bg-[#0b1322] text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-11 bg-[#00a3ff] hover:bg-[#008fe0] text-black font-semibold font-mono uppercase tracking-wider text-xs rounded-xl px-10 shadow-[0_0_20px_rgba(0,163,255,0.3)]"
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            {(createProduct.isPending || updateProduct.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
