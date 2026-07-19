import { createServerFn } from "@tanstack/react-start";
import {
  calculateDeliveryQuote,
  getStoreCoordinates,
  haversineKm,
} from "@/lib/delivery";

async function geocodePincode(pincode: string) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "HaTikvahCareStore/1.0 (hatikvahcare@gmail.com)",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Unable to look up pincode right now.");
  }

  const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  const match = results[0];

  if (!match) {
    throw new Error("Pincode not found. Please enter a valid 6-digit Indian pincode.");
  }

  return {
    latitude: Number(match.lat),
    longitude: Number(match.lon),
    label: match.display_name,
  };
}

export const calculateDeliveryFromPincode = createServerFn({ method: "POST" })
  .validator((data: { pincode: string; itemsSubtotal: number }) => data)
  .handler(async ({ data }) => {
    const pincode = data.pincode.replace(/\D/g, "").slice(0, 6);

    if (pincode.length !== 6) {
      throw new Error("Enter a valid 6-digit pincode.");
    }

    const destination = await geocodePincode(pincode);
    const store = getStoreCoordinates();
    const distanceKm = haversineKm(
      store.latitude,
      store.longitude,
      destination.latitude,
      destination.longitude,
    );
    const quote = calculateDeliveryQuote(distanceKm, data.itemsSubtotal);

    return {
      pincode,
      distanceKm: quote.distanceKm,
      deliveryFee: quote.deliveryFee,
      freeDelivery: quote.freeDelivery,
      locationLabel: destination.label,
    };
  });
