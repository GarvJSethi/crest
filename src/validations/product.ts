import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  description: z.string().min(1, "Description is required").max(5000),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().uuid("Select a valid category"),
  brand: z.string().max(100).optional(),
  material: z.string().max(200).optional(),
  careInstructions: z.string().max(1000).optional(),
  basePrice: z.number().int().positive("Price must be positive"),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  weightGrams: z.number().int().positive().optional().nullable(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).optional(),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  size: z.string().min(1, "Size is required"),
  color: z.string().min(1, "Color is required"),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  priceOverride: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative").default(0),
});

export const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  altText: z.string().max(200).optional(),
  displayOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
  colorVariant: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
