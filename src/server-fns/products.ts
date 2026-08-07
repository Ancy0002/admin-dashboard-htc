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
  toLiveProductImageUrl,
  uploadProductImageDataUrl,
} from "@/lib/storage";
import { requireAdminSessionData } from "@/lib/admin-session";

function isUsableImageUrl(image: string) {
  const value = image.trim();
  if (!value) return false;
  if (value.includes("placehold.co")) return false;
  if (value.startsWith("data:") || value.startsWith("blob:")) return false;
  return true;
}


function resolveProductImage(image: string) {
  if (!isUsableImageUrl(image)) return "";
  return toLiveProductImageUrl(image.trim());
}

async function assertAdmin() {
  await requireAdminSessionData();
}

async function persistImageOrDefault(value: string) {
  const trimmed = value.trim();
  if (!isUsableImageUrl(trimmed) && !trimmed.startsWith("data:")) {
    return "";
  }

  try {
    const persisted = await persistProductImage(trimmed);
    return resolveProductImage(persisted) || "";
  } catch {
    // S3 optional — return empty string if upload fails.
    return "";
  }
}

async function withPersistedImages(
  data: ValidatedCreateProductInput,
): Promise<ValidatedCreateProductInput> {
  const [image, gallery, brandImage] = await Promise.all([
    persistImageOrDefault(data.image),
    Promise.all(
      data.gallery.map(async (url) => {
        try {
          const persisted = await persistProductImage(url);
          return toLiveProductImageUrl(persisted);
        } catch {
          return "";
        }
      }),
    ).then((urls) => urls.filter(Boolean)),
    data.brandImage?.trim()
      ? persistImageOrDefault(data.brandImage).catch(() => "")
      : Promise.resolve(""),
  ]);

  return {
    ...data,
    image: toLiveProductImageUrl(image) || image,
    gallery,
    brandImage: brandImage ? toLiveProductImageUrl(brandImage) : "",
  };
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

  const image = resolveProductImage(data.image);

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

/** Distinct categories currently stored in the shared product table. */
export const getAdminProductCategories = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();
  const rows = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category).filter(Boolean);
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

/**
 * Compares the newest listed admin product against hatikvahcare.com.
 * If admin has it but live returns Product Not Found, DATABASE_URL on the
 * running main app is not the same DB (or the process needs restart --update-env).
 */
export const checkStorefrontSync = createServerFn({ method: "GET" }).handler(async () => {
  await assertAdmin();

  const storeUrl = (
    process.env.VITE_STORE_URL || "https://hatikvahcare.com"
  ).replace(/\/$/, "");

  const latest = await prisma.product.findFirst({
    where: { isListed: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  });

  if (!latest) {
    return {
      synced: true as const,
      storeUrl,
      checkedProductId: null as string | null,
      checkedProductName: null as string | null,
      liveProductUrl: null as string | null,
      liveStatus: "no-listed-products" as const,
      message: "No listed products in admin database yet.",
    };
  }

  const liveProductUrl = `${storeUrl}/product/${latest.id}`;
  try {
    const response = await fetch(liveProductUrl, {
      method: "GET",
      headers: { Accept: "text/html" },
      cache: "no-store",
    });
    const html = await response.text();
    const notFound = /Product Not Found/i.test(html);
    const synced = !notFound;

    return {
      synced,
      storeUrl,
      checkedProductId: latest.id,
      checkedProductName: latest.name,
      liveProductUrl,
      liveStatus: notFound ? ("not-found" as const) : ("ok" as const),
      message: synced
        ? `Live site can see “${latest.name}”. Admin and ${storeUrl} are using the same catalog.`
        : `“${latest.name}” is in admin DB but missing on ${storeUrl}. On the Linux main app, set the same DATABASE_URL as this admin and restart with: pm2 restart <app> --update-env`,
    };
  } catch {
    return {
      synced: false as const,
      storeUrl,
      checkedProductId: latest.id,
      checkedProductName: latest.name,
      liveProductUrl,
      liveStatus: "unreachable" as const,
      message: `Could not reach ${liveProductUrl}. Check that the main site is online.`,
    };
  }
});
