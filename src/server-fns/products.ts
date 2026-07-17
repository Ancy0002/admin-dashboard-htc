import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatCurrency, formatPriceRange, productShortId, sanitizeImageUrl } from "@/lib/admin-utils";
import type { CreateProductInput } from "@/lib/product-form-types";

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
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, reviews: true },
    });

    if (!product) return null;

    const minPrice = product.sizes.length > 0 ? Math.min(...product.sizes.map((s) => s.price)) : 0;

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: minPrice,
      image: sanitizeImageUrl(product.image),
      isListed: product.isListed,
      stockStatus: product.stockStatus,
      salesCount: product.salesCount,
    };
  });

export const createAdminProduct = createServerFn({ method: "POST" })
  .validator((data: CreateProductInput) => data)
  .handler(async ({ data }) => {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        category: data.category,
        description: data.description,
        image: data.image,
        weight: data.weight || null,
        gallery: data.gallery,
        keyIngredients: data.keyIngredients,
        skinType: data.skinType,
        benefit: data.benefit,
        additionalInfo: Object.keys(data.additionalInfo).length > 0 ? data.additionalInfo : undefined,
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
      },
    });

    return { id: product.id };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await prisma.product.delete({ where: { id } });
    return { success: true };
  });
