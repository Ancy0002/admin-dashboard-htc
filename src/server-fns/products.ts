import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatPriceRange, productShortId, sanitizeImageUrl } from "@/lib/admin-utils";
import {
  createProductSchema,
  updateProductSchema,
  type ValidatedCreateProductInput,
} from "@/lib/product-schema";

function productScalars(data: ValidatedCreateProductInput) {
  return {
    name: data.name,
    category: data.category,
    description: data.description,
    image: data.image,
    weight: data.weight || null,
    gallery: data.gallery,
    keyIngredients: data.keyIngredients,
    skinType: data.skinType,
    benefit: data.benefit,
    additionalInfo:
      Object.keys(data.additionalInfo).length > 0 ? data.additionalInfo : undefined,
    note: data.note || null,
    dispatchmentDetails: data.dispatchmentDetails || null,
    returnableInfo: data.returnableInfo || null,
    features: data.features,
    isBestSeller: data.isBestSeller,
    salesCount: data.salesCount,
    excerpt: data.excerpt || null,
    totalRating: data.totalRating,
    brandName: data.brandName || null,
    brandImage: data.brandImage || null,
    dispatchTime: data.dispatchTime || null,
    isReturnable: data.isReturnable,
    stockStatus: data.stockStatus,
  };
}

function productRelations(data: ValidatedCreateProductInput) {
  return {
    sizes: {
      create: data.sizes.map((s) => ({ size: s.size, price: s.price })),
    },
    quantityVariants: {
      create: data.quantityVariants.map((qv, index) => ({
        quantity: qv.quantity,
        pricePerUnit: qv.pricePerUnit,
        savingsPercent: qv.savingsPercent,
        savedAmount: qv.savedAmount,
        position: index,
      })),
    },
    reviews: {
      create: data.reviews.map((r) => ({
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
      })),
    },
  };
}

export const getAdminProducts = createServerFn({ method: "GET" }).handler(async () => {
  const products = await prisma.product.findMany({
    include: { sizes: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => {
    const prices = p.sizes.map((s) => s.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return {
      id: p.id,
      shortId: productShortId(p.id),
      name: p.name,
      category: p.category,
      priceRange: formatPriceRange(minPrice, maxPrice),
      minPrice,
      maxPrice,
      stockStatus: p.stockStatus,
      visibility: p.isListed ? "Listed" : "Hidden",
      image: sanitizeImageUrl(p.image),
      salesCount: p.salesCount,
      isListed: p.isListed,
      isBestSeller: p.isBestSeller,
    };
  });
});

export const getAdminProductStats = createServerFn({ method: "GET" }).handler(async () => {
  const [total, active, outOfStock] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isListed: true, stockStatus: "IN_STOCK" } }),
    prisma.product.count({ where: { stockStatus: { not: "IN_STOCK" } } }),
  ]);

  return { total, active, outOfStock };
});

export const getAdminProductById = createServerFn({ method: "GET" })
  .validator((id: string) => {
    if (!id?.trim()) throw new Error("Product id is required.");
    return id.trim();
  })
  .handler(async ({ data: id }) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        quantityVariants: { orderBy: { position: "asc" } },
        reviews: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!product) return null;

    const additionalInfo =
      product.additionalInfo &&
      typeof product.additionalInfo === "object" &&
      !Array.isArray(product.additionalInfo)
        ? (product.additionalInfo as Record<string, string>)
        : {};

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      keyIngredients: product.keyIngredients,
      skinType: product.skinType,
      benefit: product.benefit,
      weight: product.weight ?? "",
      image: sanitizeImageUrl(product.image),
      gallery: product.gallery.map(sanitizeImageUrl),
      isBestSeller: product.isBestSeller,
      salesCount: product.salesCount,
      excerpt: product.excerpt ?? "",
      totalRating: product.totalRating,
      brandName: product.brandName ?? "",
      brandImage: product.brandImage ?? "",
      stockStatus: product.stockStatus,
      dispatchTime: product.dispatchTime ?? "",
      isReturnable: product.isReturnable,
      isListed: product.isListed,
      sizes: product.sizes.map((s) => ({ id: s.id, size: s.size, price: s.price })),
      quantityVariants: product.quantityVariants.map((qv) => ({
        id: qv.id,
        quantity: qv.quantity,
        pricePerUnit: qv.pricePerUnit,
        savingsPercent: qv.savingsPercent,
        savedAmount: qv.savedAmount,
      })),
      features: product.features,
      additionalInfo,
      note: product.note ?? "",
      dispatchmentDetails: product.dispatchmentDetails ?? "",
      returnableInfo: product.returnableInfo ?? "",
      reviews: product.reviews.map((r) => ({
        id: r.id,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
      })),
    };
  });

async function replaceProductRelations(productId: string, data: ValidatedCreateProductInput) {
  await prisma.$transaction([
    prisma.size.deleteMany({ where: { productId } }),
    prisma.quantityVariant.deleteMany({ where: { productId } }),
    prisma.review.deleteMany({ where: { productId } }),
    prisma.product.update({
      where: { id: productId },
      data: {
        ...productScalars(data),
        ...productRelations(data),
      },
    }),
  ]);
}

export const updateAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateProductSchema.parse(data))
  .handler(async ({ data }) => {
    const existing = await prisma.product.findUnique({ where: { id: data.id } });
    if (!existing) throw new Error("Product not found");

    const { id, ...input } = data;
    await replaceProductRelations(id, input);
    return { id };
  });

export const createAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => createProductSchema.parse(data))
  .handler(async ({ data }) => {
    const product = await prisma.product.create({
      data: {
        ...productScalars(data),
        ...productRelations(data),
      },
    });

    return { id: product.id };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .validator((id: string) => {
    if (!id?.trim()) throw new Error("Product id is required.");
    return id.trim();
  })
  .handler(async ({ data: id }) => {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  });
