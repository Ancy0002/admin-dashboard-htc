import { useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Image, Plus, Save, Trash2, TrendingUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { INPUT_CLASS, LABEL_CLASS } from "@/lib/admin-form-styles";
import { readFileAsDataUrl } from "@/lib/file-utils";
import {
  createAdminProduct,
  updateAdminProduct,
  uploadAdminProductImage,
} from "@/server-fns/products";
import {
  PRODUCT_CATEGORIES,
  STOCK_STATUS_OPTIONS,
  type CreateProductInput,
  type ProductFormInitialData,
  type QuantityTierRow,
  type ReviewRow,
  type SizeRow,
  type SpecRow,
} from "@/lib/product-form-types";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-success" : "bg-muted")}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function CardSection({
  title,
  icon,
  subtitle,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-bold">
            {icon}
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function buildPayload(state: {
  name: string;
  category: string;
  description: string;
  keyIngredients: string;
  skinType: string;
  benefit: string;
  weight: string;
  image: string;
  gallery: string[];
  isBestSeller: boolean;
  isListed: boolean;
  salesCount: string;
  excerpt: string;
  totalRating: string;
  brandName: string;
  brandImage: string;
  stockStatus: string;
  dispatchTime: string;
  isReturnable: boolean;
  sizes: SizeRow[];
  quantityTiers: QuantityTierRow[];
  features: string[];
  specs: SpecRow[];
  note: string;
  dispatchmentDetails: string;
  returnableInfo: string;
  reviews: ReviewRow[];
}): CreateProductInput | null {
  if (!state.name.trim()) return null;
  if (!state.description.trim()) return null;

  const additionalInfo = Object.fromEntries(
    state.specs.filter((s) => s.spec.trim()).map((s) => [s.spec.trim(), s.value.trim()]),
  );

  return {
    name: state.name.trim(),
    category: state.category,
    description: state.description.trim(),
    keyIngredients: state.keyIngredients.trim() || "N/A",
    skinType: state.skinType.trim() || "All types",
    benefit: state.benefit.trim() || "N/A",
    weight: state.weight.trim(),
    image: state.image.trim() || "https://placehold.co/600x600?text=Product",
    gallery: state.gallery.filter(Boolean),
    isBestSeller: state.isBestSeller,
    isListed: state.isListed,
    salesCount: Number(state.salesCount) || 0,
    excerpt: state.excerpt.trim(),
    totalRating: Number(state.totalRating) || 0,
    brandName: state.brandName.trim(),
    brandImage: state.brandImage.trim(),
    stockStatus: state.stockStatus,
    dispatchTime: state.dispatchTime.trim(),
    isReturnable: state.isReturnable,
    sizes: state.sizes
      .filter((s) => s.size.trim())
      .map((s) => ({ size: s.size.trim(), price: Number(s.price) || 0 })),
    quantityVariants: state.quantityTiers
      .filter((t) => t.quantity.trim())
      .map((t) => ({
        quantity: Number(t.quantity) || 1,
        pricePerUnit: Number(t.pricePerUnit) || 0,
        savedAmount: t.savedAmount ? Number(t.savedAmount) : null,
        savingsPercent: t.savingsPercent ? Number(t.savingsPercent) : null,
      })),
    features: state.features.filter((f) => f.trim()),
    additionalInfo,
    note: state.note.trim(),
    dispatchmentDetails: state.dispatchmentDetails.trim(),
    returnableInfo: state.returnableInfo.trim(),
    reviews: state.reviews
      .filter((r) => r.userName.trim() && r.comment.trim())
      .map((r) => ({
        userName: r.userName.trim(),
        rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
        comment: r.comment.trim(),
      })),
  };
}

function initSizes(data?: ProductFormInitialData): SizeRow[] {
  if (data?.sizes.length) {
    return data.sizes.map((s) => ({ size: s.size, price: String(s.price) }));
  }
  return [];
}

function initQuantityTiers(data?: ProductFormInitialData): QuantityTierRow[] {
  if (data?.quantityVariants.length) {
    return data.quantityVariants.map((qv) => ({
      quantity: String(qv.quantity),
      pricePerUnit: String(qv.pricePerUnit),
      savedAmount: qv.savedAmount != null ? String(qv.savedAmount) : "",
      savingsPercent: qv.savingsPercent != null ? String(qv.savingsPercent) : "",
    }));
  }
  return [{ quantity: "1", pricePerUnit: "0", savedAmount: "", savingsPercent: "" }];
}

function initSpecs(data?: ProductFormInitialData): SpecRow[] {
  if (data?.additionalInfo && Object.keys(data.additionalInfo).length > 0) {
    return Object.entries(data.additionalInfo).map(([spec, value]) => ({ spec, value }));
  }
  return [];
}

function initReviews(data?: ProductFormInitialData): ReviewRow[] {
  if (data?.reviews.length) {
    return data.reviews.map((r) => ({
      userName: r.userName,
      rating: String(r.rating),
      comment: r.comment,
    }));
  }
  return [];
}

type ProductFormProps = {
  mode: "create" | "edit";
  initialData?: ProductFormInitialData;
};

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const createProduct = useServerFn(createAdminProduct);
  const updateProduct = useServerFn(updateAdminProduct);
  const uploadImage = useServerFn(uploadAdminProductImage);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [name, setName] = useState(initialData?.name ?? "");
  const [category, setCategory] = useState(
    initialData?.category ?? PRODUCT_CATEGORIES[0],
  );
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [keyIngredients, setKeyIngredients] = useState(initialData?.keyIngredients ?? "");
  const [skinType, setSkinType] = useState(initialData?.skinType ?? "");
  const [benefit, setBenefit] = useState(initialData?.benefit ?? "");
  const [weight, setWeight] = useState(initialData?.weight ?? "");
  const [image, setImage] = useState(initialData?.image ?? "");
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery ?? []);
  const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller ?? false);
  const [isListed, setIsListed] = useState(initialData?.isListed ?? true);
  const [salesCount, setSalesCount] = useState(String(initialData?.salesCount ?? 0));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [totalRating, setTotalRating] = useState(String(initialData?.totalRating ?? 0));
  const [brandName, setBrandName] = useState(initialData?.brandName ?? "");
  const [brandImage, setBrandImage] = useState(initialData?.brandImage ?? "");
  const [stockStatus, setStockStatus] = useState(initialData?.stockStatus ?? "IN_STOCK");
  const [dispatchTime, setDispatchTime] = useState(initialData?.dispatchTime ?? "");
  const [isReturnable, setIsReturnable] = useState(initialData?.isReturnable ?? true);
  const [sizes, setSizes] = useState<SizeRow[]>(() => initSizes(initialData));
  const [quantityTiers, setQuantityTiers] = useState<QuantityTierRow[]>(() =>
    initQuantityTiers(initialData),
  );
  const [features, setFeatures] = useState<string[]>(
    initialData?.features.length ? initialData.features : [],
  );
  const [featureInput, setFeatureInput] = useState("");
  const [specs, setSpecs] = useState<SpecRow[]>(() => initSpecs(initialData));
  const [note, setNote] = useState(initialData?.note ?? "");
  const [dispatchmentDetails, setDispatchmentDetails] = useState(
    initialData?.dispatchmentDetails ?? "",
  );
  const [returnableInfo, setReturnableInfo] = useState(initialData?.returnableInfo ?? "");
  const [reviews, setReviews] = useState<ReviewRow[]>(() => initReviews(initialData));

  const uploadFileToStorage = async (file: File) => {
    const dataUrl = await readFileAsDataUrl(file);
    const result = await uploadImage({ data: { dataUrl } });
    return result.url;
  };

  const handleMainImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadFileToStorage(file);
      setImage(url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingImage(true);
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadFileToStorage(file)));
      setGallery((prev) => [...prev, ...urls]);
      toast.success(urls.length === 1 ? "Gallery image uploaded" : `${urls.length} gallery images uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload gallery image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const payload = buildPayload({
      name,
      category,
      description,
      keyIngredients,
      skinType,
      benefit,
      weight,
      image,
      gallery,
      isBestSeller,
      isListed,
      salesCount,
      excerpt,
      totalRating,
      brandName,
      brandImage,
      stockStatus,
      dispatchTime,
      isReturnable,
      sizes,
      quantityTiers,
      features,
      specs,
      note,
      dispatchmentDetails,
      returnableInfo,
      reviews,
    });

    if (!payload) {
      toast.error("Product title and description are required.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit" && initialData) {
        await updateProduct({ data: { ...payload, id: initialData.id } });
        toast.success("Product updated");
      } else {
        await createProduct({ data: payload });
        toast.success("Product created");
      }
      await router.navigate({ to: "/admin/products" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const value = featureInput.trim();
    if (!value) return;
    setFeatures((prev) => [...prev, value]);
    setFeatureInput("");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-10 pt-10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {mode === "edit" ? "Edit Product" : "Upload New Product"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Saves directly to the shared catalog used by hatikvahcare.com.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? "Saving..." : uploadingImage ? "Uploading..." : "Save Product"}
        </button>
      </div>

      <div className="space-y-6 p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <CardSection title="Main Product Image" icon={<Image className="h-5 w-5" aria-hidden="true" />}>
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => mainImageRef.current?.click()}
                className="relative flex aspect-square w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/30 transition hover:bg-secondary/50 disabled:opacity-60"
              >
                {image ? (
                  <img
                    src={image}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="grid h-14 w-14 place-items-center rounded-xl bg-card">
                      <Upload className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="font-semibold">
                      {uploadingImage ? "Uploading..." : "Click to upload"}
                    </div>
                    <div className="text-center text-xs text-muted-foreground">
                      Stored as a public URL for hatikvahcare.com
                      <br />
                      High resolution PNG or JPG (Recommended: 1000×1000px)
                    </div>
                  </>
                )}
                {uploadingImage && image ? (
                  <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm font-medium">
                    Uploading...
                  </div>
                ) : null}
              </button>
              <input
                ref={mainImageRef}
                type="file"
                accept="image/*"
                hidden
                disabled={uploadingImage}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleMainImageUpload(file);
                  e.target.value = "";
                }}
              />
            </CardSection>

            <CardSection
              title="Gallery Images"
              icon={<Image className="h-5 w-5" aria-hidden="true" />}
              action={
                <button
                  type="button"
                  disabled={uploadingImage}
                  className="text-sm text-primary disabled:opacity-50"
                  onClick={() => galleryRef.current?.click()}
                >
                  Add More
                </button>
              }
            >
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={uploadingImage}
                onChange={(e) => {
                  if (e.target.files?.length) void handleGalleryUpload(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap gap-3">
                {gallery.map((url, i) => (
                  <div key={i} className="group relative aspect-square w-32">
                    <img src={url} alt="" className="h-full w-full rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => setGallery(gallery.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 rounded-full bg-destructive/90 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => galleryRef.current?.click()}
                  className="flex aspect-square w-32 items-center justify-center rounded-xl border-2 border-dashed border-border text-2xl text-muted-foreground hover:bg-secondary/40 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              {gallery.length === 0 ? (
                <p className="mt-3 text-xs italic text-muted-foreground">No gallery images added yet.</p>
              ) : null}
            </CardSection>
          </div>

          <div className="space-y-6">
            <CardSection title="General Information">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Product Title</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. Green Apple Shine Shampoo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Category</label>
                  <select
                    className={INPUT_CLASS}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    {!PRODUCT_CATEGORIES.includes(category as (typeof PRODUCT_CATEGORIES)[number]) ? (
                      <option value={category}>{category}</option>
                    ) : null}
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className={LABEL_CLASS}>Product Description</label>
                <textarea
                  className={cn(INPUT_CLASS, "min-h-32")}
                  placeholder="Describe the product's unique qualities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Key Ingredients</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. Neem, Aloe Vera"
                    value={keyIngredients}
                    onChange={(e) => setKeyIngredients(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Skin Type</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. Oily, All types"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Benefit</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. Deep cleansing"
                    value={benefit}
                    onChange={(e) => setBenefit(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Weight</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. 100g, 50ml"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
                  <div>
                    <div className="text-sm font-semibold">Best Seller Product</div>
                    <div className="text-xs text-muted-foreground">Feature on home page</div>
                  </div>
                  <Toggle checked={isBestSeller} onChange={setIsBestSeller} />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-4">
                  <div>
                    <div className="text-sm font-semibold">Listed on Website</div>
                    <div className="text-xs text-muted-foreground">
                      Show on hatikvahcare.com when enabled
                    </div>
                  </div>
                  <Toggle checked={isListed} onChange={setIsListed} />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>
                    <span className="inline-flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Simulated Sales Count
                    </span>
                  </label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    value={salesCount}
                    onChange={(e) => setSalesCount(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={LABEL_CLASS}>Product Excerpt</label>
                  <textarea
                    className={cn(INPUT_CLASS, "min-h-24")}
                    placeholder="Short description for thumbnails..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Total Review Rating</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    value={totalRating}
                    onChange={(e) => setTotalRating(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Brand Name</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="Brand name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Brand Image URL (Optional)</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="https://..."
                    value={brandImage}
                    onChange={(e) => setBrandImage(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Stock Status</label>
                  <select
                    className={INPUT_CLASS}
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                  >
                    {STOCK_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                    {!STOCK_STATUS_OPTIONS.some((opt) => opt.value === stockStatus) ? (
                      <option value={stockStatus}>{stockStatus}</option>
                    ) : null}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Dispatch Time</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. within 24 hours"
                    value={dispatchTime}
                    onChange={(e) => setDispatchTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/50 p-4">
                <div>
                  <div className="text-sm font-semibold">Returnable Item</div>
                  <div className="text-xs text-muted-foreground">
                    Is this product eligible for returns?
                  </div>
                </div>
                <Toggle checked={isReturnable} onChange={setIsReturnable} />
              </div>
            </CardSection>
          </div>
        </div>

        <CardSection
          title="Sizes & Pricing"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-primary"
              onClick={() => setSizes([...sizes, { size: "", price: "" }])}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Size
            </button>
          }
        >
          {sizes.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No sizes added yet.</p>
          ) : null}
          <div className="space-y-3">
            {sizes.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <div>
                  <label className={LABEL_CLASS}>Size/Volume</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. 100ml"
                    value={row.size}
                    onChange={(e) => {
                      const next = [...sizes];
                      next[i] = { ...row, size: e.target.value };
                      setSizes(next);
                    }}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Price (₹)</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    value={row.price}
                    onChange={(e) => {
                      const next = [...sizes];
                      next[i] = { ...row, price: e.target.value };
                      setSizes(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSizes(sizes.filter((_, j) => j !== i))}
                  className="rounded-lg bg-destructive/10 p-3 text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </CardSection>

        <CardSection
          title="Quantity Pricing"
          subtitle="Configure pricing based on quantity purchased."
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-primary"
              onClick={() =>
                setQuantityTiers([
                  ...quantityTiers,
                  { quantity: "", pricePerUnit: "", savedAmount: "", savingsPercent: "" },
                ])
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Tier
            </button>
          }
        >
          <div className="space-y-3">
            {quantityTiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3">
                <div>
                  <label className={LABEL_CLASS}>Quantity</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    value={tier.quantity}
                    onChange={(e) => {
                      const next = [...quantityTiers];
                      next[i] = { ...tier, quantity: e.target.value };
                      setQuantityTiers(next);
                    }}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Price/Unit (₹)</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    value={tier.pricePerUnit}
                    onChange={(e) => {
                      const next = [...quantityTiers];
                      next[i] = { ...tier, pricePerUnit: e.target.value };
                      setQuantityTiers(next);
                    }}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Saved Amount (₹)</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    placeholder="Auto/Man"
                    value={tier.savedAmount}
                    onChange={(e) => {
                      const next = [...quantityTiers];
                      next[i] = { ...tier, savedAmount: e.target.value };
                      setQuantityTiers(next);
                    }}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Savings %</label>
                  <input
                    className={INPUT_CLASS}
                    type="number"
                    placeholder="Auto/Man"
                    value={tier.savingsPercent}
                    onChange={(e) => {
                      const next = [...quantityTiers];
                      next[i] = { ...tier, savingsPercent: e.target.value };
                      setQuantityTiers(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setQuantityTiers(quantityTiers.filter((_, j) => j !== i))}
                  className="rounded-lg bg-destructive/10 p-3 text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </CardSection>

        <CardSection title="Product Features">
          <div className="mb-3 flex flex-wrap gap-2">
            {features.map((feature, i) => (
              <span
                key={`${feature}-${i}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm"
              >
                {feature}
                <button
                  type="button"
                  className="text-muted-foreground"
                  onClick={() => setFeatures(features.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={INPUT_CLASS}
              placeholder="e.g. Paraben Free"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <button
              type="button"
              onClick={addFeature}
              className="rounded-lg bg-primary px-4 text-sm text-primary-foreground"
            >
              Add
            </button>
          </div>
        </CardSection>

        <CardSection
          title="Additional Information"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-primary"
              onClick={() => setSpecs([...specs, { spec: "", value: "" }])}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Spec
            </button>
          }
        >
          <div className="space-y-3">
            {specs.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <div>
                  <label className={LABEL_CLASS}>Specification</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. Weight"
                    value={row.spec}
                    onChange={(e) => {
                      const next = [...specs];
                      next[i] = { ...row, spec: e.target.value };
                      setSpecs(next);
                    }}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Value</label>
                  <input
                    className={INPUT_CLASS}
                    placeholder="e.g. 500g"
                    value={row.value}
                    onChange={(e) => {
                      const next = [...specs];
                      next[i] = { ...row, value: e.target.value };
                      setSpecs(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                  className="rounded-lg bg-destructive/10 p-3 text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </CardSection>

        <CardSection title="Policy Notes">
          <div>
            <label className={LABEL_CLASS}>Note</label>
            <textarea
              className={cn(INPUT_CLASS, "min-h-24")}
              placeholder="Add any specific notes about the product..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <label className={LABEL_CLASS}>Dispatchment Details</label>
            <textarea
              className={cn(INPUT_CLASS, "min-h-24")}
              placeholder="Details about when and how the product is dispatched..."
              value={dispatchmentDetails}
              onChange={(e) => setDispatchmentDetails(e.target.value)}
            />
          </div>
          <div className="mt-5">
            <label className={LABEL_CLASS}>Returnable Info</label>
            <textarea
              className={cn(INPUT_CLASS, "min-h-24")}
              placeholder="Details regarding the return policy for this product..."
              value={returnableInfo}
              onChange={(e) => setReturnableInfo(e.target.value)}
            />
          </div>
        </CardSection>

        <CardSection
          title="Customer Reviews (Initial)"
          action={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-primary"
              onClick={() =>
                setReviews([...reviews, { userName: "", rating: "5", comment: "" }])
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Review
            </button>
          }
        >
          {reviews.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No initial reviews.</p>
          ) : null}
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div key={i} className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Review {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setReviews(reviews.filter((_, j) => j !== i))}
                    className="rounded-lg bg-destructive/10 p-2 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS}>Customer Name</label>
                    <input
                      className={INPUT_CLASS}
                      value={review.userName}
                      onChange={(e) => {
                        const next = [...reviews];
                        next[i] = { ...review, userName: e.target.value };
                        setReviews(next);
                      }}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Rating (1-5)</label>
                    <input
                      className={INPUT_CLASS}
                      type="number"
                      value={review.rating}
                      onChange={(e) => {
                        const next = [...reviews];
                        next[i] = { ...review, rating: e.target.value };
                        setReviews(next);
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Comment</label>
                  <textarea
                    className={cn(INPUT_CLASS, "min-h-20")}
                    value={review.comment}
                    onChange={(e) => {
                      const next = [...reviews];
                      next[i] = { ...review, comment: e.target.value };
                      setReviews(next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardSection>
      </div>
    </div>
  );
}
