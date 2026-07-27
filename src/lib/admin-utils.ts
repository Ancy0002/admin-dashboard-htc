/** Normalize stored image paths to public URLs. */
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

  const endpoint = process.env.S3_ENDPOINT || "";
  const bucket = process.env.S3_BUCKET_NAME || "products";
  if (!endpoint || !bucket) return url;

  const key = url.replace(/^\//, "");
  const supabaseMatch = endpoint.match(/https:\/\/([^.]+)\.storage\.supabase\.co/);
  if (supabaseMatch) {
    return `https://${supabaseMatch[1]}.supabase.co/storage/v1/object/public/${bucket}/${key}`;
  }

  return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
}

export function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatIndianCurrency(amount: number) {
  return formatCurrency(amount);
}

export function formatPriceRange(min: number, max: number) {
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

export function productShortId(id: string) {
  return id.slice(-6).toUpperCase();
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
