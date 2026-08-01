import "dotenv/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "Storage is not configured. Add S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT to .env (local) or your host env (Vercel/Lovable), then restart the app.",
    );
  }

  return new S3Client({
    region: process.env.S3_REGION || "ap-south-1",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

/** Must match main app `product.ts` sanitizeUrl (bucket + project hardcoding). */
const LIVE_STORAGE_PROJECT_ID = "tdonwvbgqyyfkatrdxsx";
const LIVE_STORAGE_BUCKET = "Products";

function getBucketName() {
  // Main website always reads from the "Products" bucket.
  return LIVE_STORAGE_BUCKET;
}

function getPublicObjectUrl(key: string) {
  const normalizedKey = key.replace(/^\//, "");
  // Exact public URL shape expected by hatikvahcare.com product.ts:
  // https://tdonwvbgqyyfkatrdxsx.storage.supabase.co/storage/v1/object/public/Products/uploads/...
  return `https://${LIVE_STORAGE_PROJECT_ID}.storage.supabase.co/storage/v1/object/public/${LIVE_STORAGE_BUCKET}/${normalizedKey}`;
}

/** Normalize any stored image value into the live-site URL shape when possible. */
export function toLiveProductImageUrl(url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) return trimmed;

  if (
    trimmed.includes(`${LIVE_STORAGE_PROJECT_ID}.storage.supabase.co`) &&
    !trimmed.includes("@")
  ) {
    return trimmed;
  }

  const match = trimmed.match(/uploads\/(.*)$/);
  if (match) {
    return getPublicObjectUrl(`uploads/${match[1]}`);
  }

  return trimmed;
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data.");
  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

/** Upload a data-URL image to shared storage so hatikvahcare.com can load it. */
export async function uploadProductImageDataUrl(dataUrl: string, folder = "uploads") {
  const { contentType, buffer } = parseDataUrl(dataUrl);
  const ext = extensionForContentType(contentType);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const bucket = getBucketName();

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code =
      error && typeof error === "object" && "name" in error
        ? String((error as { name?: string }).name)
        : "";
    if (
      code === "NoSuchBucket" ||
      /bucket.*(not found|does not exist)/i.test(message) ||
      /NoSuchBucket/i.test(message)
    ) {
      throw new Error(
        `Storage bucket "${bucket}" was not found. In Supabase → Storage create a public bucket named exactly "${bucket}" (case-sensitive), set S3_BUCKET_NAME to that same name, then restart the app.`,
      );
    }
    throw error instanceof Error ? error : new Error(message);
  }

  return getPublicObjectUrl(key);
}

/** Keep existing http(s) URLs; upload data URLs to S3. */
export async function persistProductImage(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:")) {
    return uploadProductImageDataUrl(trimmed);
  }
  return trimmed;
}

export async function persistProductImages(values: string[]) {
  return Promise.all(values.map((value) => persistProductImage(value)));
}

function getObjectKeyFromUrl(url: string) {
  const bucket = getBucketName();
  const publicMatch = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  if (publicMatch) return decodeURIComponent(publicMatch[1]);

  const minioMatch = url.match(new RegExp(`${bucket}/(.+)$`));
  if (minioMatch) return decodeURIComponent(minioMatch[1]);

  return null;
}

export async function uploadCataloguePdfFile(id: string, fileName: string, content: Buffer) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `catalogues/${id}-${safeName}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: content,
      ContentType: "application/pdf",
    }),
  );

  return {
    key,
    url: getPublicObjectUrl(key),
  };
}

export async function deleteStorageObject(url: string | null | undefined) {
  if (!url) return;

  const key = getObjectKeyFromUrl(url);
  if (!key) return;

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    }),
  );
}

export async function deleteCataloguePdfFile(url: string | null | undefined) {
  await deleteStorageObject(url);
}

/** Best-effort cleanup of product image objects (ignores missing/foreign URLs). */
export async function deleteProductImageFiles(urls: Array<string | null | undefined>) {
  await Promise.all(
    urls.map(async (url) => {
      try {
        await deleteStorageObject(url);
      } catch {
        // Ignore cleanup failures so product DB deletes still succeed.
      }
    }),
  );
}
