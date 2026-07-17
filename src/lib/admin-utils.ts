const minioEndpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://82.25.108.30:9000";
const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME || "hatikvahstorage";

export function sanitizeImageUrl(url: string) {
  if (!url) return url;
  if (url.includes(minioEndpoint)) return url;

  const match = url.match(/uploads\/(.*)$/);
  if (match) {
    return `${minioEndpoint}/${bucketName}/uploads/${encodeURIComponent(match[1])}`;
  }

  return url;
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
