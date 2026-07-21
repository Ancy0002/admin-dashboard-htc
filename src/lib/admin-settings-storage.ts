const STORAGE_KEY = "htc-admin-settings";

export type DeliveryTier = {
  id: string;
  radius: number;
  fee: number;
};

export type AdminSettings = {
  storeName: string;
  storeAddress: string;
  latitude: string;
  longitude: string;
  gst: string;
  freeDeliveryAbove: string;
  deliveryTiers: DeliveryTier[];
};

export function loadAdminSettings(): AdminSettings | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      storeName: String(parsed.storeName ?? ""),
      storeAddress: String(parsed.storeAddress ?? ""),
      latitude: String(parsed.latitude ?? ""),
      longitude: String(parsed.longitude ?? ""),
      gst: String(parsed.gst ?? ""),
      freeDeliveryAbove: String(parsed.freeDeliveryAbove ?? ""),
      deliveryTiers: Array.isArray(parsed.deliveryTiers)
        ? parsed.deliveryTiers.map((tier, index) => ({
            id: String(tier?.id ?? `tier-${index}`),
            radius: Number(tier?.radius ?? 0),
            fee: Number(tier?.fee ?? 0),
          }))
        : [],
    };
  } catch {
    return null;
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
