export type DeliveryTierSetting = { radius: number; fee: number };

export type StoreSettingsData = {
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
  gstPercent: number;
  freeDeliveryAbove: number;
  deliveryTiers: DeliveryTierSetting[];
};

/** Defaults match https://hatikvahcare.com contact / LocalBusiness schema. */
export const DEFAULT_STORE_SETTINGS: StoreSettingsData = {
  storeName: "HaTikvah Care",
  storeAddress:
    "Eshwar nilayam, Plot no 4-1447, Kondapur, Golden Tulip Estate, JV Hills, Gachibowli, Hyderabad, Telangana 500084",
  latitude: 17.440081,
  longitude: 78.348915,
  gstPercent: 18,
  freeDeliveryAbove: 1500,
  deliveryTiers: [
    { radius: 5, fee: 40 },
    { radius: 10, fee: 70 },
    { radius: 20, fee: 120 },
    { radius: 50, fee: 250 },
  ],
};
