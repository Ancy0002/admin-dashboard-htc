import { DELIVERY_TIERS, FREE_DELIVERY_ABOVE, STORE_LOCATION } from "@/lib/store-settings";

type DeliveryTier = { radius: number; fee: number };

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

export function getTierDeliveryFee(distanceKm: number, tiers: DeliveryTier[] = [...DELIVERY_TIERS]) {
  const sorted = [...tiers].sort((a, b) => a.radius - b.radius);
  const tier = sorted.find((item) => distanceKm <= item.radius);
  return tier?.fee ?? sorted[sorted.length - 1]?.fee ?? 0;
}

export function calculateDeliveryQuote(distanceKm: number, itemsSubtotal: number) {
  const fee = getTierDeliveryFee(distanceKm);
  const freeDelivery = itemsSubtotal >= FREE_DELIVERY_ABOVE;

  return {
    distanceKm: Math.round(distanceKm * 10) / 10,
    deliveryFee: freeDelivery ? 0 : fee,
    freeDelivery,
  };
}

export function calculateOrderTotals(itemsSubtotal: number, deliveryFee: number, gstPercent = 18) {
  const taxableValue = itemsSubtotal;
  const gst = Math.round((taxableValue * gstPercent) / 100);
  const grandTotal = itemsSubtotal + deliveryFee + gst;

  return { taxableValue, gst, grandTotal };
}

export function getStoreCoordinates() {
  return {
    latitude: STORE_LOCATION.latitude,
    longitude: STORE_LOCATION.longitude,
  };
}
