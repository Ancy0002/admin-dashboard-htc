import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getS3Client() {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.S3_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error(
      "PDF storage is not configured. Add S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT.",
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
  const endpoint = process.env.S3_ENDPOINT || "";
  const bucket = getBucketName();
  const match = endpoint.match(/https:\/\/([^.]+)\.storage\.supabase\.co/);

  if (match) {
    return `https://${match[1]}.supabase.co/storage/v1/object/public/${bucket}/${key}`;
  }

  const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://82.25.108.30:9000";
  return `${minioEndpoint}/${bucket}/${key}`;
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

export async function deleteCataloguePdfFile(url: string | null | undefined) {
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
