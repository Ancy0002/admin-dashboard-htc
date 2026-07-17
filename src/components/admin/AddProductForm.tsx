import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ChevronLeft,
  CloudUpload,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { createAdminProduct } from "@/server-fns/products";
import {
  PRODUCT_CATEGORIES,
  STOCK_STATUS_OPTIONS,
  type QuantityTierRow,
  type ReviewRow,
  type SizeRow,
  type SpecRow,
} from "@/lib/product-form-types";
import { cn } from "@/lib/utils";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-primary">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-y rounded-xl border border-border bg-secondary/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
}

export function AddProductForm() {
  const router = useRouter();
  const createProduct = useServerFn(createAdminProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [keyIngredients, setKeyIngredients] = useState("");
  const [skinType, setSkinType] = useState("");
  const [benefit, setBenefit] = useState("");
  const [weight, setWeight] = useState("");
  const [image, setImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [salesCount, setSalesCount] = useState("0");
  const [excerpt, setExcerpt] = useState("");
  const [totalRating, setTotalRating] = useState("0");
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState("");
  const [stockStatus, setStockStatus] = useState("IN_STOCK");
  const [dispatchTime, setDispatchTime] = useState("");
  const [isReturnable, setIsReturnable] = useState(true);
  const [sizes, setSizes] = useState<SizeRow[]>([{ size: "", price: "" }]);
  const [quantityTiers, setQuantityTiers] = useState<QuantityTierRow[]>([
    { quantity: "1", pricePerUnit: "", savedAmount: "", savingsPercent: "" },
  ]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [specs, setSpecs] = useState<SpecRow[]>([{ spec: "", value: "" }]);
  const [note, setNote] = useState("");
  const [dispatchmentDetails, setDispatchmentDetails] = useState("");
  const [returnableInfo, setReturnableInfo] = useState("");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Product title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Product description is required.");
      return;
    }

    setSaving(true);
    try {
      const additionalInfo = Object.fromEntries(
        specs.filter((s) => s.spec.trim()).map((s) => [s.spec.trim(), s.value.trim()]),
      );

      const result = await createProduct({
        data: {
          name: name.trim(),
          category,
          description: description.trim(),
          keyIngredients: keyIngredients.trim() || "N/A",
          skinType: skinType.trim() || "All types",
          benefit: benefit.trim() || "N/A",
          weight: weight.trim(),
          image: image.trim() || "https://placehold.co/600x600?text=Product",
          gallery: gallery.filter(Boolean),
          isBestSeller,
          salesCount: Number(salesCount) || 0,
          excerpt: excerpt.trim(),
          totalRating: Number(totalRating) || 0,
          brandName: brandName.trim(),
          brandImage: brandImage.trim(),
          stockStatus,
          dispatchTime: dispatchTime.trim(),
          isReturnable,
          sizes: sizes
            .filter((s) => s.size.trim())
            .map((s) => ({ size: s.size.trim(), price: Number(s.price) || 0 })),
          quantityVariants: quantityTiers
            .filter((t) => t.quantity.trim())
            .map((t) => ({
              quantity: Number(t.quantity) || 1,
              pricePerUnit: Number(t.pricePerUnit) || 0,
              savedAmount: t.savedAmount ? Number(t.savedAmount) : null,
              savingsPercent: t.savingsPercent ? Number(t.savingsPercent) : null,
            })),
          features: features.filter((f) => f.trim()),
          additionalInfo,
          note: note.trim(),
          dispatchmentDetails: dispatchmentDetails.trim(),
          returnableInfo: returnableInfo.trim(),
          reviews: reviews
            .filter((r) => r.userName.trim() && r.comment.trim())
            .map((r) => ({
              userName: r.userName.trim(),
              rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
              comment: r.comment.trim(),
            })),
        },
      });

      await router.navigate({ to: "/admin/products/$id", params: { id: result.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Upload New Product</h1>
          <p className="mt-1 text-muted-foreground">
            Add a premium product to your e-commerce collection.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-secondary disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Left: Media */}
        <div className="space-y-6 xl:col-span-1">
          <SectionCard title="Main Product Image">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-secondary/5 px-6 py-12 text-center transition-colors hover:border-primary/40 hover:bg-secondary/10">
              {image ? (
                <img src={image} alt="Preview" className="mb-4 h-32 w-32 rounded-xl object-cover" />
              ) : (
                <CloudUpload className="mb-3 h-10 w-10 text-muted-foreground" />
              )}
              <p className="font-semibold text-primary">Click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">
                High resolution PNG or JPG (Recommended: 1000x1000px)
              </p>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Paste image URL here..."
                className="mt-4 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </SectionCard>

          <SectionCard
            title="Gallery Images"
            action={<AddButton label="Add More" onClick={() => setGallery([...gallery, ""])} />}
          >
            <div className="grid grid-cols-3 gap-3">
              {gallery.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setGallery([""])}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40"
                >
                  <Plus className="h-6 w-6" />
                </button>
              ) : (
                gallery.map((url, i) => (
                  <div key={i} className="space-y-1">
                    {url ? (
                      <img src={url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border">
                        <Plus className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const next = [...gallery];
                        next[i] = e.target.value;
                        setGallery(next);
                      }}
                      placeholder="Image URL"
                      className="w-full rounded-lg border border-border bg-secondary/5 px-2 py-1 text-xs"
                    />
                  </div>
                ))
              )}
            </div>
            {gallery.length === 0 ? (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                No gallery images added yet.
              </p>
            ) : null}
          </SectionCard>
        </div>

        {/* Right: Form fields */}
        <div className="space-y-6 xl:col-span-2">
          <SectionCard title="General Information">
            <div className="space-y-4">
              <div>
                <FieldLabel>Product Title</FieldLabel>
                <TextInput value={name} onChange={setName} placeholder="e.g. Green Apple Shine Shampoo" />
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Product Description</FieldLabel>
                <TextArea
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe the product's unique qualities..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Key Ingredients</FieldLabel>
                  <TextInput value={keyIngredients} onChange={setKeyIngredients} placeholder="e.g. Neem, Aloe Vera" />
                </div>
                <div>
                  <FieldLabel>Skin Type</FieldLabel>
                  <TextInput value={skinType} onChange={setSkinType} placeholder="e.g. Oily, All types" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Benefit</FieldLabel>
                  <TextInput value={benefit} onChange={setBenefit} placeholder="e.g. Deep cleansing" />
                </div>
                <div>
                  <FieldLabel>Weight</FieldLabel>
                  <TextInput value={weight} onChange={setWeight} placeholder="e.g. 100g, 50ml" />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="">
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/5 p-4">
                <div>
                  <p className="font-bold text-primary">Best Seller Product</p>
                  <p className="text-sm text-muted-foreground">
                    Feature this product in the Best Sellers section on the home page.
                  </p>
                </div>
                <Toggle checked={isBestSeller} onChange={setIsBestSeller} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Simulated Sales Count</FieldLabel>
                  <TextInput value={salesCount} onChange={setSalesCount} type="number" placeholder="0" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used for &apos;Best Selling&apos; sort order on shop page.
                  </p>
                </div>
                <div>
                  <FieldLabel>Total Review Rating</FieldLabel>
                  <TextInput value={totalRating} onChange={setTotalRating} type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <FieldLabel>Product Excerpt</FieldLabel>
                <TextArea value={excerpt} onChange={setExcerpt} placeholder="Short description for thumbnails..." rows={3} />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Brand Name</FieldLabel>
                  <TextInput value={brandName} onChange={setBrandName} placeholder="Brand name" />
                </div>
                <div>
                  <FieldLabel>Brand Image URL (Optional)</FieldLabel>
                  <TextInput value={brandImage} onChange={setBrandImage} placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Stock Status</FieldLabel>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {STOCK_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Dispatch Time</FieldLabel>
                  <TextInput value={dispatchTime} onChange={setDispatchTime} placeholder="e.g. within 24 hours" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/5 p-4">
                <div>
                  <p className="font-bold text-primary">Returnable Item</p>
                  <p className="text-sm text-muted-foreground">Is this product eligible for returns?</p>
                </div>
                <Toggle checked={isReturnable} onChange={setIsReturnable} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Sizes & Pricing"
            action={<AddButton label="Add Size" onClick={() => setSizes([...sizes, { size: "", price: "" }])} />}
          >
            <div className="space-y-3">
              {sizes.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                  <div>
                    {i === 0 ? <FieldLabel>Size/Volume</FieldLabel> : null}
                    <TextInput value={row.size} onChange={(v) => {
                      const next = [...sizes]; next[i] = { ...row, size: v }; setSizes(next);
                    }} placeholder="e.g. 100ml" />
                  </div>
                  <div>
                    {i === 0 ? <FieldLabel>Price (₹)</FieldLabel> : null}
                    <TextInput value={row.price} onChange={(v) => {
                      const next = [...sizes]; next[i] = { ...row, price: v }; setSizes(next);
                    }} type="number" placeholder="0" />
                  </div>
                  {sizes.length > 1 ? (
                    <button type="button" onClick={() => setSizes(sizes.filter((_, j) => j !== i))} className="mb-1 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : <div className="w-4" />}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Quantity Pricing"
            subtitle="Configure pricing based on quantity purchased."
            action={<AddButton label="Add Tier" onClick={() => setQuantityTiers([...quantityTiers, { quantity: "", pricePerUnit: "", savedAmount: "", savingsPercent: "" }])} />}
          >
            <div className="space-y-3">
              {quantityTiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <div>
                    {i === 0 ? <FieldLabel>Quantity</FieldLabel> : null}
                    <TextInput value={tier.quantity} onChange={(v) => { const n = [...quantityTiers]; n[i] = { ...tier, quantity: v }; setQuantityTiers(n); }} placeholder="1" />
                  </div>
                  <div>
                    {i === 0 ? <FieldLabel>Price/Unit (₹)</FieldLabel> : null}
                    <TextInput value={tier.pricePerUnit} onChange={(v) => { const n = [...quantityTiers]; n[i] = { ...tier, pricePerUnit: v }; setQuantityTiers(n); }} type="number" placeholder="0" />
                  </div>
                  <div>
                    {i === 0 ? <FieldLabel>Saved Amount (₹)</FieldLabel> : null}
                    <TextInput value={tier.savedAmount} onChange={(v) => { const n = [...quantityTiers]; n[i] = { ...tier, savedAmount: v }; setQuantityTiers(n); }} placeholder="Auto/Manu..." />
                  </div>
                  <div>
                    {i === 0 ? <FieldLabel>Savings %</FieldLabel> : null}
                    <TextInput value={tier.savingsPercent} onChange={(v) => { const n = [...quantityTiers]; n[i] = { ...tier, savingsPercent: v }; setQuantityTiers(n); }} placeholder="Auto/Manu..." />
                  </div>
                  {quantityTiers.length > 1 ? (
                    <button type="button" onClick={() => setQuantityTiers(quantityTiers.filter((_, j) => j !== i))} className="self-end mb-1 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Product Features"
            action={<AddButton label="Add Feature" onClick={() => setFeatures([...features, ""])} />}
          >
            <div className="space-y-3">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <TextInput value={feature} onChange={(v) => { const n = [...features]; n[i] = v; setFeatures(n); }} placeholder="e.g. Paraben Free" />
                  {features.length > 1 ? (
                    <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Additional Information"
            action={<AddButton label="Add Spec" onClick={() => setSpecs([...specs, { spec: "", value: "" }])} />}
          >
            <div className="space-y-4">
              {specs.map((row, i) => (
                <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    {i === 0 ? <FieldLabel>Specification</FieldLabel> : null}
                    <TextInput value={row.spec} onChange={(v) => { const n = [...specs]; n[i] = { ...row, spec: v }; setSpecs(n); }} placeholder="e.g. Weight" />
                  </div>
                  <div>
                    {i === 0 ? <FieldLabel>Value</FieldLabel> : null}
                    <TextInput value={row.value} onChange={(v) => { const n = [...specs]; n[i] = { ...row, value: v }; setSpecs(n); }} placeholder="e.g. 500g" />
                  </div>
                  {specs.length > 1 ? (
                    <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="self-end mb-1 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
              <div>
                <FieldLabel>Note</FieldLabel>
                <TextArea value={note} onChange={setNote} placeholder="Add any specific notes about the product..." />
              </div>
              <div>
                <FieldLabel>Dispatchment Details</FieldLabel>
                <TextArea value={dispatchmentDetails} onChange={setDispatchmentDetails} placeholder="Details about when and how the product is dispatched..." />
              </div>
              <div>
                <FieldLabel>Returnable Info</FieldLabel>
                <TextArea value={returnableInfo} onChange={setReturnableInfo} placeholder="Details regarding the return policy for this product..." />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Customer Reviews (Initial)"
            action={<AddButton label="Add Review" onClick={() => setReviews([...reviews, { userName: "", rating: "5", comment: "" }])} />}
          >
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No initial reviews added yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-secondary/5 p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-primary">Review {i + 1}</span>
                      <button type="button" onClick={() => setReviews(reviews.filter((_, j) => j !== i))} className="text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <FieldLabel>Customer Name</FieldLabel>
                        <TextInput value={review.userName} onChange={(v) => { const n = [...reviews]; n[i] = { ...review, userName: v }; setReviews(n); }} placeholder="Customer name" />
                      </div>
                      <div>
                        <FieldLabel>Rating (1-5)</FieldLabel>
                        <TextInput value={review.rating} onChange={(v) => { const n = [...reviews]; n[i] = { ...review, rating: v }; setReviews(n); }} type="number" placeholder="5" />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Comment</FieldLabel>
                      <TextArea value={review.comment} onChange={(v) => { const n = [...reviews]; n[i] = { ...review, comment: v }; setReviews(n); }} placeholder="Review comment..." rows={2} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
