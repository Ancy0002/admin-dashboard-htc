type AdminAuthContext = {
  email: string;
  maskedEmail: string;
};

/** Client-only cache so /admin beforeLoad skips a server round-trip between sidebar clicks. */
let cachedAdmin: AdminAuthContext | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export function getCachedAdminAuth() {
  if (!cachedAdmin) return null;
  if (Date.now() - cachedAt > CACHE_TTL_MS) {
    cachedAdmin = null;
    return null;
  }
  return cachedAdmin;
}

export function setCachedAdminAuth(admin: AdminAuthContext) {
  cachedAdmin = admin;
  cachedAt = Date.now();
}

export function clearCachedAdminAuth() {
  cachedAdmin = null;
  cachedAt = 0;
}
