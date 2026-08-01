import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatPriceRange, productShortId, sanitizeImageUrl } from "@/lib/admin-utils";
import {
  createProductSchema,
  updateProductSchema,
  type ValidatedCreateProductInput,
} from "@/lib/product-schema";
import {
  deleteProductImageFiles,
  persistProductImage,
  persistProductImages,
  uploadProductImageDataUrl,
} from "@/lib/storage";
import { requireAdminSessionData } from "@/lib/admin-session";

async function assertAdmin() {
  await requireAdminSessionData();
}

async function withPersistedImages(
  data: ValidatedCreateProductInput,
): Promise<ValidatedCreateProductInput> {
  const [image, gallery, brandImage] = await Promise.all([
    persistProductImage(data.image),
    persistProductImages(data.gallery),
    data.brandImage?.trim()
      ? persistProductImage(data.brandImage)
      : Promise.resolve(data.brandImage),
  ]);

  return { ...data, image, gallery, brandImage };
}

function normalizeProduct(data: ValidatedCreateProductInput): ValidatedCreateProductInput {
  if (data.sizes.length === 0) {
    throw new Error("Add at least one size with a price.");
  }

  const basePrice = data.sizes[0]?.price ?? 0;
  let quantityVariants = data.quantityVariants.filter((qv) => qv.quantity >= 1);

  if (quantityVariants.length === 0) {
    quantityVariants = [
      {
        quantity: 1,
        pricePerUnit: basePrice,
        savingsPercent: null,
        savedAmount: null,
      },
    ];
  } else {
    quantityVariants = quantityVariants.map((qv) => ({
      ...qv,
      pricePerUnit: qv.pricePerUnit > 0 ? qv.pricePerUnit : basePrice,
    }));
  }

  const image = data.image.trim();
  if (
    data.isListed &&
    (!image || image.includes("placehold.co") || image.startsWith("data:") || image.startsWith("blob:"))
  ) {
    throw new Error(
      "Upload a real product image before listing on the website. You can save as Hidden without an image.",
    );
  }

  return {
    ...data,
    image,
    weight: data.weight ?? "",
    excerpt: data.excerpt ?? "",
    brandName: data.brandName ?? "",
    brandImage: data.brandImage ?? "",
    dispatchTime: data.dispatchTime ?? "",
    note: data.note ?? "",
    dispatchmentDetails: data.dispatchmentDetails ?? "",
    returnableInfo: data.returnableInfo ?? "",
    keyIngredients: data.keyIngredients?.trim() || "N/A",
    skinType: data.skinType?.trim() || "All types",
    benefit: data.benefit?.trim() || "N/A",
    quantityVariants,
  };
}

function productScalars(data: ValidatedCreateProductInput) {
  return {
    name: data.name,
    category: data.category,
    description: data.description,
    image: data.image,
    weight: data.weight || "",
    gallery: data.gallery,
    keyIngredients: data.keyIngredients,
    skinType: data.skinType,
    benefit: data.benefit,
    additionalInfo:
      Object.keys(data.additionalInfo).length > 0 ? data.additionalInfo : undefined,
    note: data.note || "",
    dispatchmentDetails: data.dispatchmentDetails || "",
    returnableInfo: data.returnableInfo || "",
    features: data.features,
    isBestSeller: data.isBestSeller,
    isListed: data.isListed,
    salesCount: data.salesCount,
    excerpt: data.excerpt || "",
    totalRating: data.totalRating,
    brandName: data.brandName || "",
    brandImage: data.brandImage || "",
    dispatchTime: data.dispatchTime || "",
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

function mapListItem(p: {
  id: string;
  name: string;
  category: string;
  image: string;
  stockStatus: string;
  salesCount: number;
  isListed: boolean;
  isBestSeller: boolean;
  sizes: { price: number }[];
}) {
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
    hasSizes: p.sizes.length > 0,
  };
}

function mapProductDetail(product: {
  id: string;
  name: string;
  category: string;
  description: string;
  keyIngredients: string;
  skinType: string;
  benefit: string;
  weight: string | null;
  image: string;
  gallery: string[];
  isBestSeller: boolean;
  isListed: boolean;
  salesCount: number;
  excerpt: string | null;
  totalRating: number;
  brandName: string | null;
  brandImage: string | null;
  stockStatus: string;
  dispatchTime: string | null;
  isReturnable: boolean;
  additionalInfo: unknown;
  note: string | null;
  dispatchmentDetails: string | null;
  returnableInfo: string | null;
  features: string[];
  sizes: { id: string; size: string; price: number }[];
  quantityVariants: {
    id: string;
    quantity: number;
    pricePerUnit: number;
    savingsPercent: number | null;
    savedAmount: number | null;
  }[];
  reviews: { id: string; userName: string; rating: number; comment: string }[];
}) {
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
    isListed: product.isListed,
    salesCount: product.salesCount,
    excerpt: product.excerpt ?? "",
    totalRating: product.totalRating,
    brandName: product.brandName ?? "",
    brandImage: product.brandImage ?? "",
    stockStatus: product.stockStatus,
    dispatchTime: product.dispatchTime ?? "",
    isReturnable: product.isReturnable,
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
}

export const uploadAdminProductImage = createServerFn({ method: "POST" })
  .validator((data: { dataUrl: string }) => {
    const dataUrl = data?.dataUrl?.trim() ?? "";
    if (!dataUrl.startsWith("data:")) throw new Error("Invalid image data.");
    if (dataUrl.length > 6_000_000) throw new Error("Image is too large.");
    return { dataUrl };
  })
  .handler(async ({ data }) => {
    await assertAdmin();
    const url = await uploadProductImageDataUrl(data.dataUrl);
    return { url };
  });

export const getAdminProducts = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  const products = await prisma.product.findMany({
    include: { sizes: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapListItem);
});

export const getAdminProductStats = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
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
    await assertAdmin();
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        quantityVariants: { orderBy: { position: "asc" } },
        reviews: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!product) return null;
    return mapProductDetail(product);
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
    await assertAdmin();
    const { id, ...input } = data;
    const normalized = normalizeProduct(await withPersistedImages(input));
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { image: true, gallery: true, brandImage: true },
    });
    if (!existing) throw new Error("Product not found");
    await replaceProductRelations(id, normalized);

    const nextUrls = new Set(
      [normalized.image, ...normalized.gallery, normalized.brandImage].filter(Boolean),
    );
    const removed = [existing.image, ...existing.gallery, existing.brandImage].filter(
      (url): url is string => {
        if (!url) return false;
        return !nextUrls.has(url);
      },
    );
    await deleteProductImageFiles(removed);

    return { id };
  });

export const createAdminProduct = createServerFn({ method: "POST" })
  .validator((data: unknown) => createProductSchema.parse(data))
  .handler(async ({ data }) => {
    await assertAdmin();
    const normalized = normalizeProduct(await withPersistedImages(data));
    const product = await prisma.product.create({
      data: {
        ...productScalars(normalized),
        ...productRelations(normalized),
      },
    });
    return { id: product.id };
  });

export const setAdminProductListed = createServerFn({ method: "POST" })
  .validator((data: { id: string; isListed: boolean }) => {
    if (!data.id?.trim()) throw new Error("Product id is required.");
    return { id: data.id.trim(), isListed: Boolean(data.isListed) };
  })
  .handler(async ({ data }) => {
    await assertAdmin();
    await prisma.product.update({
      where: { id: data.id },
      data: { isListed: data.isListed },
    });
    return { success: true, isListed: data.isListed };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .validator((id: string) => {
    if (!id?.trim()) throw new Error("Product id is required.");
    return id.trim();
  })
  .handler(async ({ data: id }) => {
    await assertAdmin();
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { image: true, gallery: true, brandImage: true },
    });
    if (!existing) throw new Error("Product not found");

    await prisma.product.delete({ where: { id } });
    await deleteProductImageFiles([
      existing.image,
      ...existing.gallery,
      existing.brandImage,
    ]);
    return { success: true };
  });
