export const CATALOGUE_CATEGORIES = [
  "Bio Dry Amenities",
  "Bio Wet Amenities",
  "Bulk & Brackets",
  "Dry Amenities",
  "Wet Amenities",
  "Tray Amenities",
  "Housekeeping",
  "Coffee & Beverages",
  "Others",
] as const;

export type CatalogueCategory = (typeof CATALOGUE_CATEGORIES)[number];

export function isDefaultCatalogueCategory(name: string) {
  return (CATALOGUE_CATEGORIES as readonly string[]).includes(name);
}
