function getStorageEndpoint() {
  return (
    process.env.S3_ENDPOINT ||
    process.env.NEXT_PUBLIC_MINIO_ENDPOINT ||
    process.env.S3_PUBLIC_URL ||
    ""
  );
}

function getStorageBucket() {
  return process.env.S3_BUCKET_NAME || process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME || "";
}

/** Normalize stored image paths to public URLs the live site can load. */
export function sanitizeImageUrl(url: string) {
  if (!url) return url;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const endpoint = getStorageEndpoint();
  const bucket = getStorageBucket();
  if (!endpoint || !bucket) return url;

  const key = url.replace(/^\//, "");
  const supabaseMatch = endpoint.match(/https:\/\/([^.]+)\.storage\.supabase\.co/);
  if (supabaseMatch) {
    return `https://${supabaseMatch[1]}.supabase.co/storage/v1/object/public/${bucket}/${key}`;
  }

  return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatIndianCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatProductPrice(amount: number) {
  if (Number.isInteger(amount) || amount % 1 === 0) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return formatCurrency(amount);
}

export function formatPriceRange(min: number, max: number) {
  return `${formatProductPrice(min)} - ${formatProductPrice(max)}`;
}

export function productShortId(id: string) {
  return id.slice(-8).toLowerCase();
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
