export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export function assertFileSize(bytes: number, maxBytes: number, label: string) {
  if (bytes > maxBytes) {
    const maxMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`${label} must be under ${maxMb}MB.`);
  }
}

export async function readFileAsDataUrl(file: File, maxBytes = MAX_IMAGE_BYTES): Promise<string> {
  assertFileSize(file.size, maxBytes, "Image");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

export async function fileToBase64(file: File, maxBytes = MAX_PDF_BYTES): Promise<string> {
  assertFileSize(file.size, maxBytes, "File");
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
