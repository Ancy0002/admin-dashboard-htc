export const STORE_LOCATION = {
  latitude: 17.4655,
  longitude: 78.3489,
  address:
    "Eshwar Nilayam, Plot no 4-1447, Kondapur, Golden Tulip Estate, JV Hills, Gachibowli, Hyderabad, Telangana 500084",
};

export const DELIVERY_TIERS = [
  { radius: 5, fee: 40 },
  { radius: 10, fee: 70 },
  { radius: 20, fee: 120 },
  { radius: 50, fee: 250 },
] as const;

export const GST_PERCENT = 18;
export const FREE_DELIVERY_ABOVE = 1500;
