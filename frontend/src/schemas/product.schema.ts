import { z } from "zod";

const requiredNumber = (fieldLabel: string) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number({ message: `${fieldLabel} is required` }));

const optionalNumber = (fieldLabel: string) =>
  z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, z.number({ message: `${fieldLabel} must be a number` }).min(0, `${fieldLabel} cannot be negative`).optional().nullable());

const imageItemSchema = z.union([
  z.string().min(1, "Image URL cannot be empty"),
  z.custom<File>(
    (val) => typeof File !== "undefined" && val instanceof File,
    "Must be a valid image file",
  ),
]);

export const createProductSchema = z
  .object({
    name: z
      .string({ message: "Product name is required" })
      .trim()
      .min(2, "Product name must be at least 2 characters")
      .max(200, "Product name cannot exceed 200 characters"),
    slug: z
      .string({ message: "Slug is required" })
      .trim()
      .min(1, "Slug is required")
      .max(160, "Slug cannot exceed 160 characters"),
    namebn: z
      .string()
      .trim()
      .max(200, "Bengali name cannot exceed 200 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    shortDesc: z
      .string()
      .trim()
      .max(300, "Short description cannot exceed 300 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(10000, "Description cannot exceed 10000 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    categoryId: z
      .string({ message: "Category is required" })
      .trim()
      .min(1, "Please select a category"),
    price: requiredNumber("Price").refine((value) => value >= 0, {
      message: "Price cannot be negative",
    }),
    comparePrice: optionalNumber("Compare at Price"),
    costPrice: optionalNumber("Cost Price"),
    stock: requiredNumber("Stock")
      .refine((value) => Number.isInteger(value), {
        message: "Stock must be a whole number",
      })
      .refine((value) => value >= 0, {
        message: "Stock cannot be negative",
      }),
    lowStockAlert: requiredNumber("Low stock alert")
      .refine((value) => Number.isInteger(value), {
        message: "Low stock alert must be a whole number",
      })
      .refine((value) => value >= 0, {
        message: "Low stock alert cannot be negative",
      })
      .default(5),
    weight: z
      .string()
      .trim()
      .max(60, "Weight cannot exceed 60 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    sku: z
      .string()
      .trim()
      .max(80, "SKU cannot exceed 80 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isHot: z.boolean().default(false),
    metaTitle: z
      .string()
      .trim()
      .max(120, "Meta title cannot exceed 120 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    metaDesc: z
      .string()
      .trim()
      .max(250, "Meta description cannot exceed 250 characters")
      .nullable()
      .optional()
      .or(z.literal("")),
    images: z
      .array(imageItemSchema)
      .max(8, "You can upload up to 8 images")
      .default([]),
    variants: z
      .array(
        z.object({
          name: z
            .string({ message: "Variant name is required" })
            .trim()
            .min(1, "Variant name is required")
            .max(120, "Variant name cannot exceed 120 characters"),
          price: requiredNumber("Variant price").refine((val) => val >= 0, {
            message: "Variant price cannot be negative",
          }),
          comparePrice: optionalNumber("Variant compare price"),
          stock: requiredNumber("Variant stock")
            .refine((val) => Number.isInteger(val), {
              message: "Variant stock must be an integer",
            })
            .refine((val) => val >= 0, {
              message: "Variant stock cannot be negative",
            })
            .default(0),
        }),
      )
      .max(30, "You can add up to 30 variants")
      .optional(),
  })
  .superRefine((values, ctx) => {
    const variants = values.variants ?? [];
    if (variants.length === 0) return;

    const totalVariantStock = variants.reduce(
      (sum, variant) => sum + (Number(variant.stock) || 0),
      0,
    );

    if (values.stock !== totalVariantStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stock"],
        message: `Stock (${values.stock}) must equal the sum of variant stock (${totalVariantStock}).`,
      });
    }
  });

export type CreateProductFormInput = z.input<typeof createProductSchema>;
export type CreateProductInput = z.output<typeof createProductSchema>;
