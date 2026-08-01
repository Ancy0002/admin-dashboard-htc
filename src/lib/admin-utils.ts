import { toLiveProductImageUrl } from "@/lib/storage";

/** Normalize stored image paths to public URLs used by hatikvahcare.com. */
export function sanitizeImageUrl(url: string) {
  if (!url) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  return toLiveProductImageUrl(url);
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatIndianCurrency(amount: number) {
  return formatCurrency(amount);
}

export function formatPriceRange(min: number, max: number) {
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function productShortId(id: string) {
  return id.slice(-6).toUpperCase();
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
