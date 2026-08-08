import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileText, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { INPUT_CLASS, LABEL_CLASS } from "@/lib/admin-form-styles";
import { isDefaultCatalogueCategory } from "@/lib/catalogue-categories";
import { fileToBase64 } from "@/lib/file-utils";
import { DEFAULT_STORE_SETTINGS, type DeliveryTierSetting } from "@/lib/store-settings-shared";
import { STORE_URL } from "@/lib/store-url";
import {
  clearCataloguePdf,
  createCatalogue,
  deleteCatalogue,
  getAdminCatalogues,
  saveCatalogue,
  type Catalogue,
} from "@/server-fns/catalogues";
import { getAdminStoreSettings, saveStoreSettings } from "@/server-fns/store-settings";

export const Route = createFileRoute("/admin/settings")({
  loader: async () => {
    try {
      const [catalogues, settings] = await Promise.all([
        getAdminCatalogues(),
        getAdminStoreSettings(),
      ]);
      return { catalogues, settings, loadError: null as string | null };
    } catch (error) {
      console.error("[admin settings]", error);
      return {
        catalogues: [] as Catalogue[],
        settings: null,
        loadError: error instanceof Error ? error.message : "Unable to load settings.",
      };
    }
  },
  component: AdminSettings,
});

type DeliveryTierRow = { id: string; radius: number; fee: number };

function AdminSettings() {
  const { catalogues, settings, loadError } = Route.useLoaderData();
  const router = useRouter();
  const createCatalogueFn = useServerFn(createCatalogue);
  const saveCatalogueFn = useServerFn(saveCatalogue);
  const deleteCatalogueFn = useServerFn(deleteCatalogue);
  const clearCataloguePdfFn = useServerFn(clearCataloguePdf);
  const saveSettingsFn = useServerFn(saveStoreSettings);

  const [storeName, setStoreName] = useState(settings?.storeName ?? DEFAULT_STORE_SETTINGS.storeName);
  const [storeAddress, setStoreAddress] = useState(
    settings?.storeAddress ?? DEFAULT_STORE_SETTINGS.storeAddress,
  );
  const [latitude, setLatitude] = useState(
    String(settings?.latitude ?? DEFAULT_STORE_SETTINGS.latitude),
  );
  const [longitude, setLongitude] = useState(
    String(settings?.longitude ?? DEFAULT_STORE_SETTINGS.longitude),
  );
  const [gst, setGst] = useState(String(settings?.gstPercent ?? DEFAULT_STORE_SETTINGS.gstPercent));
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(
    String(settings?.freeDeliveryAbove ?? DEFAULT_STORE_SETTINGS.freeDeliveryAbove),
  );
  const [deliveryTiers, setDeliveryTiers] = useState<DeliveryTierRow[]>(
    (settings?.deliveryTiers ?? DEFAULT_STORE_SETTINGS.deliveryTiers).map(
      (tier: DeliveryTierSetting, index: number) => ({
        id: String(index + 1),
        radius: tier.radius,
        fee: tier.fee,
      }),
    ),
  );
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getName = (id: string, fallback: string) => names[id] ?? fallback;

  const refresh = async () => {
    await router.invalidate();
  };

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    setLoading(true);
    try {
      await action();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveSettingsFn({
        data: {
          storeName,
          storeAddress,
          latitude,
          longitude,
          gst,
          freeDeliveryAbove,
          deliveryTiers,
        },
      });
      toast.success("Settings saved to shared database");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 px-10 pt-10 pb-6 border-b border-border/60">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Store config and catalogues synced via the shared database used by{" "}
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              hatikvahcare.com
            </a>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="px-5 py-3 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      <div className="p-10 space-y-6 max-w-3xl">
        {loadError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {loadError.includes("StoreSettings") || loadError.includes("CataloguePdf")
              ? "Settings tables are missing. Run `npx prisma db push` on your database, then restart the app."
              : loadError}
          </div>
        ) : null}

        <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
          <h2 className="font-bold text-lg">Store</h2>
          <div>
            <label className={LABEL_CLASS}>Store Name</label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Store Address (origin for distance calculation)</label>
            <textarea
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className={`${INPUT_CLASS} min-h-20`}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL_CLASS}>Store Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Store Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>GST (%)</label>
              <input
                type="number"
                value={gst}
                onChange={(e) => setGst(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Free Delivery Above (₹)</label>
              <input
                type="number"
                value={freeDeliveryAbove}
                onChange={(e) => setFreeDeliveryAbove(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Defaults match hatikvahcare.com. Tip: Search the store address on Google Maps, right-click
            the pin, and copy the lat/lng pair.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg">Delivery Tiers</h2>
              <p className="text-sm text-muted-foreground">
                Flat fee per radius (km) from the store.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setDeliveryTiers((tiers) => [
                  ...tiers,
                  { id: crypto.randomUUID(), radius: 0, fee: 0 },
                ])
              }
              className="text-sm text-primary inline-flex items-center gap-1"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Tier
            </button>
          </div>
          <div className="space-y-3">
            {deliveryTiers.map((tier) => (
              <div key={tier.id} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                <div>
                  <label className={LABEL_CLASS}>Radius (km)</label>
                  <input
                    type="number"
                    value={tier.radius}
                    onChange={(e) =>
                      setDeliveryTiers((tiers) =>
                        tiers.map((item) =>
                          item.id === tier.id ? { ...item, radius: Number(e.target.value) } : item,
                        ),
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Fee (₹)</label>
                  <input
                    type="number"
                    value={tier.fee}
                    onChange={(e) =>
                      setDeliveryTiers((tiers) =>
                        tiers.map((item) =>
                          item.id === tier.id ? { ...item, fee: Number(e.target.value) } : item,
                        ),
                      )
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDeliveryTiers((tiers) => tiers.filter((item) => item.id !== tier.id))
                  }
                  className="p-3 rounded-lg bg-destructive/10 text-destructive"
                  aria-label="Remove delivery tier"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold text-lg">Category Catalogues (PDF)</h2>
              <p className="text-sm text-muted-foreground">
                Upload a PDF per category for the{" "}
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  hatikvahcare.com
                </a>{" "}
                &quot;Explore Our Catalog&quot; menu.
              </p>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => run(() => createCatalogueFn({ data: { name: "New catalogue" } }))}
              className="text-sm text-primary inline-flex items-center gap-1 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add PDF
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-3">
            {catalogues.map((catalogue: Catalogue) => {
              const isDefault = isDefaultCatalogueCategory(catalogue.name);

              return (
                <div
                  key={catalogue.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      value={getName(catalogue.id, catalogue.name)}
                      onChange={(e) =>
                        setNames((prev) => ({ ...prev, [catalogue.id]: e.target.value }))
                      }
                      onBlur={() =>
                        run(async () => {
                          const name = getName(catalogue.id, catalogue.name);
                          if (name === catalogue.name) return;
                          await saveCatalogueFn({ data: { id: catalogue.id, name } });
                        })
                      }
                      className={`${INPUT_CLASS} py-2 text-sm font-medium`}
                    />
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {catalogue.fileName ?? "No catalogue uploaded"}
                    </div>
                  </div>
                  {catalogue.pdfUrl ? (
                    <a
                      href={catalogue.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-accent inline-flex items-center gap-1.5"
                      title="Open uploaded PDF"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      Open
                    </a>
                  ) : null}
                  <label className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-accent inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    Upload
                    <input
                      type="file"
                      accept="application/pdf"
                      hidden
                      disabled={loading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void run(async () => {
                          const contentBase64 = await fileToBase64(file);
                          await saveCatalogueFn({
                            data: {
                              id: catalogue.id,
                              name: getName(catalogue.id, catalogue.name),
                              fileName: file.name,
                              contentBase64,
                            },
                          });
                          toast.success("Catalogue uploaded");
                        });
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      run(() =>
                        isDefault
                          ? clearCataloguePdfFn({ data: catalogue.id })
                          : deleteCatalogueFn({ data: catalogue.id }),
                      )
                    }
                    className="p-3 rounded-lg bg-destructive/10 text-destructive disabled:opacity-60"
                    aria-label={isDefault ? "Remove uploaded PDF" : "Delete catalogue"}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
