/** Category catalogue slots — matches hatikvahcare.com footer / Explore Our Catalog. */
export const CATALOGUE_CATEGORIES = [
  "Bio Dry Amenities",
  "Bio Wet Amenities",
  "Basic Dry & Wet Amenities",
  "Dry Amenities",
  "Wet Amenities",
  "Tray Amenities",
  "Bulk & Brackets",
  "Housekeeping",
  "Coffee & Beverages",
  "Others",
] as const;

export type CatalogueCategory = (typeof CATALOGUE_CATEGORIES)[number];

export function isDefaultCatalogueCategory(name: string) {
  return (CATALOGUE_CATEGORIES as readonly string[]).includes(name);
}
