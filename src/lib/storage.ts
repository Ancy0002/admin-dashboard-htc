import "dotenv/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.S3_ENDPOINT?.trim();

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "Storage is not configured. Add S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT to .env, then restart the app.",
    );
  }

  return new S3Client({
    region: process.env.S3_REGION?.trim() || "us-east-1",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

/** Bucket from .env (MinIO / S3-compatible). */
function getBucketName() {
  return process.env.S3_BUCKET_NAME?.trim() || "hatikvahstorage";
}

/** Public base URL for object links — prefers S3_PUBLIC_URL, else S3_ENDPOINT. */
function getPublicBaseUrl() {
  const publicUrl = process.env.S3_PUBLIC_URL?.trim();
  if (publicUrl) return publicUrl.replace(/\/$/, "");

  const endpoint = process.env.S3_ENDPOINT?.trim();
  if (!endpoint) {
    throw new Error("S3_ENDPOINT is not configured.");
  }
  return endpoint.replace(/\/$/, "");
}

function getPublicObjectUrl(key: string) {
  const normalizedKey = key.replace(/^\//, "");
  const bucket = getBucketName();
  return `${getPublicBaseUrl()}/${bucket}/${normalizedKey}`;
}

/** Normalize stored image values using .env storage settings. */
export function toLiveProductImageUrl(url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) return trimmed;

  // Already an absolute URL — keep as-is.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Relative object key → public MinIO/S3 URL from .env.
  return getPublicObjectUrl(trimmed.replace(/^\//, ""));
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

/** Upload a data-URL image to shared storage. */
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
        `Storage bucket "${bucket}" was not found. Create that bucket in MinIO, set S3_BUCKET_NAME to the same name, then restart the app.`,
      );
    }
    throw error instanceof Error ? error : new Error(message);
  }

  return getPublicObjectUrl(key);
}

/** Keep existing http(s) URLs; upload data URLs to S3/MinIO. */
export async function persistProductImage(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:")) {
    return uploadProductImageDataUrl(trimmed);
  }
  return toLiveProductImageUrl(trimmed);
}

export async function persistProductImages(values: string[]) {
  return Promise.all(values.map((value) => persistProductImage(value)));
}

function getObjectKeyFromUrl(url: string) {
  const bucket = getBucketName();
  const minioMatch = url.match(new RegExp(`${bucket}/(.+)$`));
  if (minioMatch) return decodeURIComponent(minioMatch[1]);

  const publicMatch = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  if (publicMatch) return decodeURIComponent(publicMatch[1]);

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
