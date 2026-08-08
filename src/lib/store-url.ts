export const STORE_URL = (import.meta.env.VITE_STORE_URL ?? "https://hatikvahcare.com").replace(
  /\/$/,
  "",
);

/** Main app product detail page - matches hatikvahcare.com `/product/[id]`. */
export function storeProductUrl(productId: string) {
  return `${STORE_URL}/product/${productId}`;
}

/** Main app shop, optionally filtered by category. */
export function storeShopUrl(category?: string) {
  if (!category?.trim() || category === "All") return `${STORE_URL}/shop`;
  return `${STORE_URL}/shop?category=${encodeURIComponent(category.trim())}`;
}
