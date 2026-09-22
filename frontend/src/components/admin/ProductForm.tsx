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
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <Info className="h-5 w-5 text-emerald-600" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold flex items-center gap-1">
                  Product Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="Sundarbans Pure Honey"
                  {...register("name")}
                  className={`h-12 rounded-xl border-gray-200 ${errors.name ? "border-red-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 font-bold">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-bold flex items-center justify-between">
                  Product Slug{" "}
                  <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                    URL Handle
                  </span>
                </Label>
                <Input
                  placeholder="sundarbans-pure-honey"
                  {...register("slug")}
                  className={`h-12 rounded-xl border-gray-200 ${errors.slug ? "border-red-500" : ""}`}
                />
                {errors.slug && (
                  <p className="text-xs text-red-500 font-bold">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">
                  Permanent link to your product
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Product Name (Bengali)</Label>
                  <Input
                    placeholder="সুন্দরবনের খাঁটি মধু"
                    {...register("namebn")}
                    className="h-12 rounded-xl border-gray-200"
                  />
                  <p className="text-xs text-red-500 font-bold">
                    {errors.namebn?.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">SKU (Stock Keeping Unit)</Label>
                  <Input
                    placeholder="HON-001"
                    {...register("sku")}
                    className="h-12 rounded-xl border-gray-200"
                  />
                  <p className="text-xs text-red-500 font-bold">
                    {errors.sku?.message}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Short Description</Label>
                <Textarea
                  placeholder="Quick overview of the product..."
                  {...register("shortDesc")}
                  rows={2}
                  className="rounded-xl border-gray-200"
                />
                <p className="text-xs text-red-500 font-bold">
                  {errors.shortDesc?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Full Description</Label>
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
                <p className="text-xs text-red-500 font-bold">
                  {errors.description?.message}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <ImageIcon className="h-5 w-5 text-emerald-600" />
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
              <p className="text-xs text-red-500 font-bold">
                {errors.images?.message}
              </p>
            </CardContent>
          </Card>

          <Card className=" border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <LayoutGrid className="h-5 w-5 text-emerald-600" />
                Variants (Options)
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", price: 0, stock: 0 })}
                className="rounded-lg font-bold"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {variants.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">
                    No variants added yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variants.map((v, index) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-end border border-gray-100 rounded-2xl bg-gray-50/30"
                    >
                      <div className="md:col-span-5 space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-500">
                          Option Name (e.g. 500g)
                        </Label>
                        <Input
                          {...register(`variants.${index}.name`)}
                          className="h-10 rounded-lg border-gray-200"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-500">
                          Price
                        </Label>
                        <Input
                          type="number"
                          {...register(`variants.${index}.price`)}
                          className="h-10 rounded-lg border-gray-200"
                        />
                        <p className="text-xs text-red-500 font-bold">
                          {errors.variants?.[index]?.price?.message}
                        </p>
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label className="font-bold text-xs uppercase text-gray-500">
                          Stock
                        </Label>
                        <Input
                          type="number"
                          {...register(`variants.${index}.stock`)}
                          className="h-10 rounded-lg border-gray-200"
                        />
                        <p className="text-xs text-red-500 font-bold">
                          {errors.variants?.[index]?.stock?.message}
                        </p>
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10 flex shrink-0"
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
          <Card className=" border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                <Settings className="h-4 w-4 text-emerald-600" />
                Visibility & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold flex items-center justify-between">
                  Category <span className="text-red-500">*</span>
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
                  triggerClassName={errors.categoryId ? "border-red-500" : ""}
                />
                {errors.categoryId && (
                  <p className="text-xs text-red-500 font-bold">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-gray-700">
                    Publish to Store
                  </Label>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-gray-700">
                    Featured Product
                  </Label>
                  <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    )}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-gray-700">Mark as Hot</Label>
                  <Controller
                    name="isHot"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                <BadgeDollarSign className="h-4 w-4 text-emerald-600" />
                Pricing & Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 border-b pb-6 border-gray-50">
                <div className="space-y-2">
                  <Label className="font-bold">Default Sale Price *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      ৳
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("price")}
                      className="h-12 rounded-xl border-gray-200 pl-8"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-500 font-bold">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-400">
                    Compare Price
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("comparePrice")}
                    className="h-12 rounded-xl border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-4 border-b pb-6 border-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                      Cost Price
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("costPrice")}
                      className="h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">
                      Weight (g/kg)
                    </Label>
                    <Input
                      placeholder="500g"
                      {...register("weight")}
                      className="h-12 rounded-xl border-gray-200"
                    />
                    {errors.weight && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Total Stock</Label>
                    <Input
                      type="number"
                      {...register("stock")}
                      className="h-12 rounded-xl border-gray-200"
                    />
                    {errors.stock && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-orange-600">
                      Low Stock Alert
                    </Label>
                    <Input
                      type="number"
                      {...register("lowStockAlert")}
                      className="h-12 rounded-xl border-orange-100 bg-orange-50/10"
                    />
                    {errors.lowStockAlert && (
                      <p className="text-xs text-red-500 font-bold">
                        {errors.lowStockAlert.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className=" border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className=" border-b">
              <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                <Info className="h-4 w-4 text-emerald-600" />
                SEO Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-gray-500">
                  Meta Title
                </Label>
                <Input
                  placeholder="Best Organic Honey in BD"
                  {...register("metaTitle")}
                  className="h-10 rounded-lg border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-gray-500">
                  Meta Description
                </Label>
                <Textarea
                  placeholder="Buy 100% pure organic honey harvested from Sundarbans..."
                  {...register("metaDesc")}
                  rows={3}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex justify-end gap-3 z-50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="container flex justify-end gap-3 px-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-12 rounded-xl font-bold px-8 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-10 shadow-lg shadow-emerald-100"
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            {(createProduct.isPending || updateProduct.isPending) && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            {isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
