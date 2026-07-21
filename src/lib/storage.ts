import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "Storage is not configured. Add S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT.",
    );
  }

  return new S3Client({
    region: process.env.S3_REGION || "ap-south-1",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

function getBucketName() {
  return process.env.S3_BUCKET_NAME || process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME || "products";
}

function getPublicObjectUrl(key: string) {
  const endpoint =
    process.env.S3_ENDPOINT || process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "";
  const bucket = getBucketName();
  const match = endpoint.match(/https:\/\/([^.]+)\.storage\.supabase\.co/);

  if (match) {
    return `https://${match[1]}.supabase.co/storage/v1/object/public/${bucket}/${key}`;
  }

  if (!endpoint) {
    throw new Error("S3_ENDPOINT is not configured.");
  }
  return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
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

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getBucketName(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

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
