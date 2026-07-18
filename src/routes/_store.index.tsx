import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  FileText,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";

export const Route = createFileRoute("/_store/")({
  component: StoreHome,
});

const categories = [
  { name: "Bio Dry Amenities", slug: "bio-dry-amenities", count: 0, initial: "B" },
  { name: "Bio Wet Amenities", slug: "bio-wet-amenities", count: 3, initial: "B" },
  { name: "Bulk & Brackets", slug: "bulk-and-brackets", count: 0, initial: "B" },
  { name: "Dry Amenities", slug: "dry-amenities", count: 0, initial: "D" },
  { name: "Wet Amenities", slug: "wet-amenities", count: 0, initial: "W" },
  { name: "Tray Amenities", slug: "tray-amenities", count: 0, initial: "T" },
  { name: "Housekeeping", slug: "housekeeping", count: 0, initial: "H" },
  { name: "Coffee & Beverages", slug: "coffee-and-beverages", count: 0, initial: "C" },
  { name: "Others", slug: "others", count: 0, initial: "O" },
] as const;

const bestSellers = [
  {
    id: "E2CDUUPQ",
    name: "Bio Bergamot & Patchouli Body Lotion 380ml (Biotique Royal) Refillable",
    category: "Bio Wet Amenities",
    price: "₹200",
    size: "380ml",
    outOfStock: true,
    bestseller: false,
  },
  {
    id: "0FRQHV2W",
    name: "Bio Bergamot & Patchouli Hand Wash 380ml (Biotique Royal) Refillable",
    category: "Bio Wet Amenities",
    price: "₹200",
    size: "380ml",
    outOfStock: false,
    bestseller: true,
  },
  {
    id: "BW6KXRQI",
    name: "Bio Bergamot & Patchouli Hair Conditioner 380ml (Biotique Royal) Refillable",
    category: "Bio Wet Amenities",
    price: "₹200",
    size: "380ml",
    outOfStock: false,
    bestseller: false,
  },
] as const;

function StoreHome() {
  return (
    <main className="flex-1">
      <div>
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Authorized Boutique Distributor • Hyderabad
              </div>
              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                Elevating Excellence in <br />
                <span className="text-primary/70">Hospitality &amp; Hygiene.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                As a trusted partner and authorized Boutique distributor, we provide premium guest
                amenities and industrial-grade cleaning solutions tailored for India&apos;s finest
                hotels, resorts, and corporate institutions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
                >
                  View catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 hover:bg-accent"
                >
                  Browse Shop
                </Link>
              </div>
            </div>
            <div className="grid aspect-square place-items-center rounded-3xl border border-border bg-gradient-to-br from-accent via-secondary to-background">
              <div className="text-center">
                <div className="font-montserrat text-7xl font-bold text-primary/30">HT</div>
                <div className="mt-2 text-sm text-muted-foreground">Crafted in small batches</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold">Paraben Free</div>
                <div className="text-sm text-muted-foreground">Clean bio formulations.</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold">Cruelty Free</div>
                <div className="text-sm text-muted-foreground">Ethically produced.</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-semibold">Fast Dispatch</div>
                <div className="text-sm text-muted-foreground">Within 24 hours.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Shop by Category</h2>
              <p className="mt-1 text-muted-foreground">
                Curated collections for every hospitality need.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Browse catalogues
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
              >
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-secondary font-montserrat text-lg font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {cat.initial}
                </div>
                <div className="mt-4 font-semibold leading-snug">{cat.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{cat.count} products</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">Best Sellers</h2>
              <p className="mt-1 text-muted-foreground">Loved by hotels and homes alike.</p>
            </div>
            <Link to="/shop" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <Link
                key={product.id}
                to="/product/$id"
                params={{ id: product.id }}
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative grid aspect-square place-items-center bg-secondary/50">
                  <div className="font-montserrat text-6xl font-bold text-primary/20">HT</div>
                  <span className="absolute top-3 left-3 rounded-md bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background">
                    {product.size}
                  </span>
                  {product.outOfStock ? (
                    <span className="absolute top-3 right-3 rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground">
                      Out of Stock
                    </span>
                  ) : null}
                  {product.bestseller ? (
                    <span className="absolute top-3 right-3 rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">
                      Bestseller
                    </span>
                  ) : null}
                </div>
                <div className="p-5">
                  <div className="text-xs text-muted-foreground">{product.category}</div>
                  <div className="mt-1 line-clamp-2 font-medium group-hover:text-primary">
                    {product.name}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="font-semibold">{product.price}</div>
                    <span
                      className={`rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 ${
                        product.outOfStock ? "cursor-not-allowed opacity-40" : ""
                      }`}
                    >
                      Add to cart
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
