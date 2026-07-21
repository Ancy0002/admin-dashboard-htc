import { createServerFn } from "@tanstack/react-start";
import {
  formatPriceRange,
  formatProductPrice,
  productShortId,
  sanitizeImageUrl,
} from "@/lib/admin-utils";
import { getStoreCategoryCards, slugToCategory } from "@/lib/store-categories";
import prisma from "@/lib/prisma";

function mapStoreProductCard(product: {
  id: string;
  name: string;
  category: string;
  image: string;
  stockStatus: string;
  isBestSeller: boolean;
  sizes: { size: string; price: number }[];
}) {
  const prices = product.sizes.map((size) => size.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const primarySize = product.sizes[0];

  return {
    id: product.id,
    shortId: productShortId(product.id),
    name: product.name,
    category: product.category,
    image: sanitizeImageUrl(product.image),
    priceRange: formatPriceRange(minPrice, maxPrice),
    minPrice,
    priceLabel: formatProductPrice(minPrice),
    sizeLabel: primarySize?.size ?? "",
    outOfStock: product.stockStatus !== "IN_STOCK",
    bestseller: product.isBestSeller,
  };
}

async function findListedProduct(idOrShortId: string) {
  const key = idOrShortId.trim();
  if (!key) return null;

  const byId = await prisma.product.findFirst({
    where: { id: key, isListed: true },
    include: {
      sizes: true,
      quantityVariants: { orderBy: { position: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (byId) return byId;

  const products = await prisma.product.findMany({
    where: { isListed: true },
    include: {
      sizes: true,
      quantityVariants: { orderBy: { position: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return (
    products.find((product) => productShortId(product.id) === key.toLowerCase()) ?? null
  );
}

export const getStoreProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await prisma.product.findMany({
    where: { isListed: true },
    include: { sizes: true },
    orderBy: [{ isBestSeller: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
  });

  return products.map(mapStoreProductCard);
});

export const getStoreHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const products = await prisma.product.findMany({
    where: { isListed: true },
    include: { sizes: true },
    orderBy: [{ isBestSeller: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
  });

  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }

  const bestSellers = products
    .filter((product) => product.isBestSeller)
    .slice(0, 8)
    .map(mapStoreProductCard);

  const featured =
    bestSellers.length > 0
      ? bestSellers
      : products.slice(0, 8).map(mapStoreProductCard);

  return {
    categories: getStoreCategoryCards(counts),
    bestSellers: featured,
  };
});

export const getStoreProductsByCategory = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (!slug?.trim()) throw new Error("Category is required.");
    return slug.trim();
  })
  .handler(async ({ data: slug }) => {
    const category = slugToCategory(slug);
    if (!category) {
      return { category: null as string | null, slug, products: [] as ReturnType<typeof mapStoreProductCard>[] };
    }

    const products = await prisma.product.findMany({
      where: { isListed: true, category },
      include: { sizes: true },
      orderBy: [{ isBestSeller: "desc" }, { salesCount: "desc" }, { createdAt: "desc" }],
    });

    return {
      category,
      slug,
      products: products.map(mapStoreProductCard),
    };
  });

export const getStoreProductById = createServerFn({ method: "GET" })
  .validator((id: string) => {
    if (!id?.trim()) throw new Error("Product id is required.");
    return id.trim();
  })
  .handler(async ({ data: id }) => {
    const product = await findListedProduct(id);
    if (!product) return null;

    return {
      id: product.id,
      shortId: productShortId(product.id),
      name: product.name,
      category: product.category,
      description: product.description,
      image: sanitizeImageUrl(product.image),
      gallery: product.gallery.map(sanitizeImageUrl),
      keyIngredients: product.keyIngredients,
      skinType: product.skinType,
      benefit: product.benefit,
      weight: product.weight ?? "",
      excerpt: product.excerpt ?? "",
      brandName: product.brandName ?? "",
      stockStatus: product.stockStatus,
      outOfStock: product.stockStatus !== "IN_STOCK",
      isBestSeller: product.isBestSeller,
      totalRating: product.totalRating,
      features: product.features,
      sizes: product.sizes.map((size) => ({
        id: size.id,
        size: size.size,
        price: size.price,
        priceLabel: formatProductPrice(size.price),
      })),
      quantityVariants: product.quantityVariants.map((variant) => ({
        id: variant.id,
        quantity: variant.quantity,
        pricePerUnit: variant.pricePerUnit,
        savingsPercent: variant.savingsPercent,
        savedAmount: variant.savedAmount,
      })),
      reviews: product.reviews.map((review) => ({
        id: review.id,
        userName: review.userName,
        rating: review.rating,
        comment: review.comment,
      })),
    };
  });
