import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

const CATALOGUE_CATEGORIES = [
  "Bio Dry Amenities",
  "Bio Wet Amenities",
  "Bulk & Brackets",
  "Dry Amenities",
  "Wet Amenities",
  "Tray Amenities",
  "Housekeeping",
  "Coffee & Beverages",
  "Others",
] as const;

type DeliveryTier = {
  id: string;
  radius: number;
  fee: number;
};

const DEFAULT_TIERS: DeliveryTier[] = [
  { id: "1", radius: 5, fee: 40 },
  { id: "2", radius: 10, fee: 70 },
  { id: "3", radius: 20, fee: 120 },
  { id: "4", radius: 50, fee: 250 },
];

function AdminSettings() {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [storeName, setStoreName] = useState("HaTikvah");
  const [storeAddress, setStoreAddress] = useState(
    "Eshwar Nilayam, Plot no 4-1447, Kondapur, Golden Tulip Estate, JV Hills, Gachibowli, Hyderabad, Telangana 500084",
  );
  const [latitude, setLatitude] = useState("17.4655");
  const [longitude, setLongitude] = useState("78.3489");
  const [gst, setGst] = useState("18");
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState("1500");
  const [deliveryTiers, setDeliveryTiers] = useState<DeliveryTier[]>(DEFAULT_TIERS);
  const [catalogueNames, setCatalogueNames] = useState<Record<string, string>>({});

  const addTier = () => {
    setDeliveryTiers((tiers) => [
      ...tiers,
      { id: crypto.randomUUID(), radius: 0, fee: 0 },
    ]);
  };

  const removeTier = (id: string) => {
    setDeliveryTiers((tiers) => tiers.filter((tier) => tier.id !== id));
  };

  const updateTier = (id: string, field: "radius" | "fee", value: number) => {
    setDeliveryTiers((tiers) =>
      tiers.map((tier) => (tier.id === id ? { ...tier, [field]: value } : tier)),
    );
  };

  const handleCatalogueUpload = (category: string, file: File | undefined) => {
    if (!file) return;
    setCatalogueNames((prev) => ({ ...prev, [category]: file.name }));
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-10 pt-10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure store, taxes, delivery and catalogues.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground"
        >
          Save Settings
        </button>
      </div>

      <div className="max-w-3xl space-y-6 p-10">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Store</h2>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Store Name</label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Store Address (origin for distance calculation)
            </label>
            <textarea
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="min-h-20 w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Store Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Store Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">GST (%)</label>
              <input
                type="number"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Free Delivery Above (₹)</label>
              <input
                type="number"
                value={freeDeliveryAbove}
                onChange={(e) => setFreeDeliveryAbove(e.target.value)}
                className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Search the store address on Google Maps, right-click the pin, and copy the lat/lng
            pair.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Delivery Tiers</h2>
              <p className="text-sm text-muted-foreground">
                Flat fee per radius (km) from the store.
              </p>
            </div>
            <button
              type="button"
              onClick={addTier}
              className="inline-flex items-center gap-1 text-sm text-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Tier
            </button>
          </div>
          <div className="space-y-3">
            {deliveryTiers.map((tier) => (
              <div key={tier.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Radius (km)</label>
                  <input
                    type="number"
                    value={tier.radius}
                    onChange={(e) => updateTier(tier.id, "radius", Number(e.target.value))}
                    className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Fee (₹)</label>
                  <input
                    type="number"
                    value={tier.fee}
                    onChange={(e) => updateTier(tier.id, "fee", Number(e.target.value))}
                    className="w-full rounded-lg border-0 bg-input px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTier(tier.id)}
                  className="rounded-lg bg-destructive/10 p-3 text-destructive"
                  aria-label="Remove delivery tier"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Category Catalogues (PDF)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a PDF per category. Customers can download these from the home page &quot;View
            catalogue&quot; button.
          </p>
          <div className="mt-5 space-y-3">
            {CATALOGUE_CATEGORIES.map((category) => (
              <div
                key={category}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{category}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {catalogueNames[category] ?? "No catalogue uploaded"}
                  </div>
                </div>
                <input
                  ref={(el) => {
                    fileInputRefs.current[category] = el;
                  }}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => handleCatalogueUpload(category, e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[category]?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  Upload
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
