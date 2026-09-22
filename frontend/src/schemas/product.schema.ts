import { z } from "zod";

const requiredNumber = (fieldLabel: string) =>
  z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined)
        return undefined;
      const parsed = typeof value === "number" ? value : Number(value);
      return Number.isNaN(parsed) ? value : parsed;
    },
    z.number({ message: `${fieldLabel} is required` }),
  );

const imageValueSchema = z.union([
  z
    .string({ message: "Image URL must be a string" })
    .trim()
    .min(1, "Image URL cannot be empty"),
  z.custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File,
    "Image must be a valid file",
  ),
]);

export const createProductSchema = z
  .object({
    name: z
      .string({ message: "Product name is required" })
      .trim()
      .min(3, "Product name must be at least 3 characters")
      .max(200, "Product name cannot exceed 200 characters"),
    slug: z
      .string({ message: "Slug must be a string" })
      .trim()
      .min(1, "Slug is required")
      .max(160, "Slug cannot exceed 160 characters"),
    namebn: z
      .string({ message: "Bengali name must be a string" })
      .trim()
      .max(200, "Bengali name cannot exceed 200 characters")
      .nullable()
      .optional(),
    description: z
      .string({ message: "Description must be a string" })
      .trim()
      .max(5000, "Description cannot exceed 5000 characters")
      .nullable()
      .optional(),
    shortDesc: z
      .string({ message: "Short description must be a string" })
      .trim()
      .min(1, "Short description is required")
      .max(300, "Short description cannot exceed 300 characters"),
    categoryId: z
      .string({ message: "Category is required" })
      .trim()
      .min(1, "Please select a category"),
    price: requiredNumber("Price").refine((value) => value >= 0, {
      message: "Price cannot be negative",
    }),
    comparePrice: z.coerce
      .number({ message: "Compare price must be a valid number" })
      .min(0, "Compare price cannot be negative")
      .optional()
      .nullable()
      .or(z.literal("")),
    costPrice: z.coerce
      .number({ message: "Cost price must be a valid number" })
      .min(0, "Cost price cannot be negative")
      .optional()
      .nullable()
      .or(z.literal("")),
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
      }),
    weight: z
      .string({ message: "Weight must be a string" })
      .trim()
      .min(1, "Weight is required")
      .max(60, "Weight cannot exceed 60 characters"),
    sku: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isHot: z.boolean().default(false),
    metaTitle: z
      .string({ message: "Meta title must be a string" })
      .trim()
      .max(60, "Meta title cannot exceed 60 characters")
      .nullable()
      .optional(),
    metaDesc: z
      .string({ message: "Meta description must be a string" })
      .trim()
      .max(160, "Meta description cannot exceed 160 characters")
      .nullable()
      .optional(),
    images: z
      .array(imageValueSchema, { message: "Images must be a valid list" })
      .min(1, "At least 1 image is required")
      .max(5, "You can upload up to 5 images"),
    variants: z
      .array(
        z.object({
          name: z
            .string({ message: "Variant name is required" })
            .trim()
            .min(1, "Variant name is required")
            .max(120, "Variant name cannot exceed 120 characters"),
          price: z.coerce
            .number({ message: "Variant price must be a valid number" })
            .min(0, "Variant price cannot be negative"),
          comparePrice: z.coerce
            .number({ message: "Variant compare price must be a valid number" })
            .min(0, "Variant compare price cannot be negative")
            .optional()
            .nullable(),
          stock: z.coerce
            .number({ message: "Variant stock must be a valid number" })
            .int("Variant stock must be a whole number")
            .min(0, "Variant stock cannot be negative")
            .default(0),
        }),
      )
      .max(20, "You can add up to 20 variants")
      .optional(),
  })
  .superRefine((values, ctx) => {
    const variants = values.variants ?? [];

    if (variants.length === 0) {
      return;
    }

    const totalVariantStock = variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );

    if (values.stock !== totalVariantStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stock"],
        message:
          "When variants are added, product stock must equal the total stock of all variants.",
      });
    }
  });

export type CreateProductFormInput = z.input<typeof createProductSchema>;
export type CreateProductInput = z.output<typeof createProductSchema>;
