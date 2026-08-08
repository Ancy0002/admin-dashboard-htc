import { createServerFn } from "@tanstack/react-start";
import { requireAdminSessionData } from "@/lib/admin-session";
import prisma from "@/lib/prisma";
import {
  DEFAULT_STORE_SETTINGS,
  type DeliveryTierSetting,
  type StoreSettingsData,
} from "@/lib/store-settings-shared";

function mapSettings(row: {
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
  gstPercent: number;
  freeDeliveryAbove: number;
  deliveryTiers: unknown;
}): StoreSettingsData {
  const tiers = Array.isArray(row.deliveryTiers)
    ? (row.deliveryTiers as DeliveryTierSetting[])
    : DEFAULT_STORE_SETTINGS.deliveryTiers;

  return {
    storeName: row.storeName,
    storeAddress: row.storeAddress,
    latitude: row.latitude,
    longitude: row.longitude,
    gstPercent: row.gstPercent,
    freeDeliveryAbove: row.freeDeliveryAbove,
    deliveryTiers: tiers,
  };
}

async function ensureStoreSettings() {
  const existing = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (existing) return mapSettings(existing);

  const created = await prisma.storeSettings.create({
    data: {
      id: "default",
      storeName: DEFAULT_STORE_SETTINGS.storeName,
      storeAddress: DEFAULT_STORE_SETTINGS.storeAddress,
      latitude: DEFAULT_STORE_SETTINGS.latitude,
      longitude: DEFAULT_STORE_SETTINGS.longitude,
      gstPercent: DEFAULT_STORE_SETTINGS.gstPercent,
      freeDeliveryAbove: DEFAULT_STORE_SETTINGS.freeDeliveryAbove,
      deliveryTiers: DEFAULT_STORE_SETTINGS.deliveryTiers,
    },
  });

  return mapSettings(created);
}

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  return ensureStoreSettings();
});

export const getAdminStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSessionData();
  return ensureStoreSettings();
});

export const saveStoreSettings = createServerFn({ method: "POST" })
  .validator(
    (data: {
      storeName: string;
      storeAddress: string;
      latitude: string;
      longitude: string;
      gst: string;
      freeDeliveryAbove: string;
      deliveryTiers: { id?: string; radius: number; fee: number }[];
    }) => data,
  )
  .handler(async ({ data }) => {
    await requireAdminSessionData();

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);
    const gstPercent = Number(data.gst);
    const freeDeliveryAbove = Number(data.freeDeliveryAbove);

    if (!data.storeName.trim()) throw new Error("Store name is required.");
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Valid latitude and longitude are required.");
    }

    const deliveryTiers = data.deliveryTiers
      .filter((tier) => tier.radius > 0)
      .map(({ radius, fee }) => ({ radius, fee }));

    const saved = await prisma.storeSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        storeName: data.storeName.trim(),
        storeAddress: data.storeAddress.trim(),
        latitude,
        longitude,
        gstPercent: Number.isFinite(gstPercent) ? gstPercent : 18,
        freeDeliveryAbove: Number.isFinite(freeDeliveryAbove) ? freeDeliveryAbove : 1500,
        deliveryTiers,
      },
      update: {
        storeName: data.storeName.trim(),
        storeAddress: data.storeAddress.trim(),
        latitude,
        longitude,
        gstPercent: Number.isFinite(gstPercent) ? gstPercent : 18,
        freeDeliveryAbove: Number.isFinite(freeDeliveryAbove) ? freeDeliveryAbove : 1500,
        deliveryTiers,
      },
    });

    return mapSettings(saved);
  });
