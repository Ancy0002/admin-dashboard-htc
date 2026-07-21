const SESSION_KEY = "htc_store_session";

export type StoreSession = {
  maskedEmail: string;
};

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***@***";

  const visible = local.slice(0, 1);
  const hidden = Math.max(local.length - 1, 8);
  return `${visible}${"*".repeat(hidden)}@${domain}`;
}
export function getStoreSession(): StoreSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoreSession;
  } catch {
    return null;
  }
}

export function setStoreSession(session: StoreSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoreSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

