import { PRODUCT_CATEGORIES } from "@/lib/product-form-types";

export function categoryToSlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugToCategory(slug: string) {
  const normalized = slug.trim().toLowerCase();
  return (
    PRODUCT_CATEGORIES.find((category) => categoryToSlug(category) === normalized) ?? null
  );
}

export function getStoreCategoryCards(counts: Record<string, number> = {}) {
  return PRODUCT_CATEGORIES.map((name) => ({
    name,
    slug: categoryToSlug(name),
    count: counts[name] ?? 0,
    initial: name.charAt(0).toUpperCase(),
  }));
}
