export type SizeRow = { size: string; price: string };
export type QuantityTierRow = {
  quantity: string;
  pricePerUnit: string;
  savedAmount: string;
  savingsPercent: string;
};
export type SpecRow = { spec: string; value: string };
export type ReviewRow = { userName: string; rating: string; comment: string };

export type CreateProductInput = {
  name: string;
  category: string;
  description: string;
  keyIngredients: string;
  skinType: string;
  benefit: string;
  weight: string;
  image: string;
  gallery: string[];
  isBestSeller: boolean;
  salesCount: number;
  excerpt: string;
  totalRating: number;
  brandName: string;
  brandImage: string;
  stockStatus: string;
  dispatchTime: string;
  isReturnable: boolean;
  sizes: { size: string; price: number }[];
  quantityVariants: {
    quantity: number;
    pricePerUnit: number;
    savingsPercent: number | null;
    savedAmount: number | null;
  }[];
  features: string[];
  additionalInfo: Record<string, string>;
  note: string;
  dispatchmentDetails: string;
  returnableInfo: string;
  reviews: { userName: string; rating: number; comment: string }[];
};

export const PRODUCT_CATEGORIES = [
  "Bio Dry Amenities",
  "Bio Wet Amenities",
  "Guest Amenities",
  "Dry Amenities",
  "Wet Amenities",
  "Tray Amenities",
  "HOSPITALITY",
  "Coffee & Beverages",
  "Others",
] as const;

export const STOCK_STATUS_OPTIONS = [
  { value: "IN_STOCK", label: "In Stock" },
  { value: "OUT_OF_STOCK", label: "Out of Stock" },
  { value: "LOW_STOCK", label: "Low Stock" },
] as const;
