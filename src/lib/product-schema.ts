import { z } from "zod";

const stockStatusSchema = z.enum(["IN_STOCK", "OUT_OF_STOCK", "BACKORDER"]);

const sizeSchema = z.object({
  size: z.string().trim().min(1).max(100),
  price: z.number().min(0).max(1_000_000),
});

const quantityVariantSchema = z.object({
  quantity: z.number().int().min(1).max(10_000),
  pricePerUnit: z.number().min(0).max(1_000_000),
  savingsPercent: z.number().min(0).max(100).nullable(),
  savedAmount: z.number().min(0).max(1_000_000).nullable(),
});

const reviewSchema = z.object({
  userName: z.string().trim().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(5000),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10_000),
  keyIngredients: z.string().max(2000),
  skinType: z.string().max(200),
  benefit: z.string().max(2000),
  weight: z.string().max(100),
  image: z.string().min(1).max(6_000_000),
  gallery: z.array(z.string().max(6_000_000)).max(20),
  isBestSeller: z.boolean(),
  salesCount: z.number().int().min(0).max(10_000_000),
  excerpt: z.string().max(2000),
  totalRating: z.number().min(0).max(5),
  brandName: z.string().max(200),
  brandImage: z.string().max(2000),
  stockStatus: stockStatusSchema,
  dispatchTime: z.string().max(200),
  isReturnable: z.boolean(),
  sizes: z.array(sizeSchema).max(50),
  quantityVariants: z.array(quantityVariantSchema).max(50),
  features: z.array(z.string().max(200)).max(50),
  additionalInfo: z.record(z.string().max(200), z.string().max(2000)),
  note: z.string().max(5000),
  dispatchmentDetails: z.string().max(5000),
  returnableInfo: z.string().max(5000),
  reviews: z.array(reviewSchema).max(100),
});

export const updateProductSchema = createProductSchema.extend({
  id: z.string().trim().min(1).max(100),
});

export type ValidatedCreateProductInput = z.infer<typeof createProductSchema>;
export type ValidatedUpdateProductInput = z.infer<typeof updateProductSchema>;
