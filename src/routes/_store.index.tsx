import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Leaf, Package, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/_store/")({
  component: StoreHome,
});

const categories = [
  { name: "Guest Amenities", slug: "guest-amenities", count: 24 },
  { name: "Bio Dry Amenities", slug: "bio-dry", count: 18 },
  { name: "Bio Wet Amenities", slug: "bio-wet", count: 16 },
  { name: "Coffee & Beverages", slug: "coffee", count: 12 },
] as const;

const featuredProducts = [
  { id: "1", name: "Green Apple Shampoo", price: "₹129", category: "Guest Amenities" },
  { id: "2", name: "Apricot Body Wash", price: "₹190", category: "Bio Wet Amenities" },
  { id: "3", name: "Lavender Conditioner", price: "₹149", category: "Guest Amenities" },
  { id: "4", name: "Citrus Hand Wash", price: "₹89", category: "Bio Dry Amenities" },
] as const;

function StoreHome() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:py-28">
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Premium Hospitality Supplies
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
              Elevate Every Guest Experience
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              HaTikvah Care delivers premium amenities, toiletries, and hospitality essentials for
              hotels, resorts, and serviced apartments across India.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-bold text-white transition-colors hover:bg-primary/90"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 py-3 font-bold text-primary transition-colors hover:bg-secondary/10"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <div className="relative h-72 w-full max-w-md rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-1 shadow-2xl shadow-primary/20 lg:h-96">
              <div className="flex h-full flex-col items-center justify-center rounded-[1.9rem] bg-card p-8 text-center">
                <Leaf className="mb-4 h-16 w-16 text-primary" />
                <p className="text-2xl font-bold text-primary">Eco-Friendly</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sustainable amenities for conscious hospitality
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-primary">Shop by Category</h2>
          <p className="mt-2 text-muted-foreground">Browse our curated hospitality collections</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to="/category/$slug"
              params={{ slug: cat.slug }}
              className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-primary">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{cat.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-primary">Best Sellers</h2>
              <p className="mt-1 text-muted-foreground">Our most popular hospitality products</p>
            </div>
            <Link to="/shop" className="font-bold text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                to="/product/$id"
                params={{ id: product.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-background shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
                  <Package className="h-16 w-16 text-primary/30 transition-transform group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium text-muted-foreground">{product.category}</p>
                  <h3 className="mt-1 font-bold text-primary">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-primary">{product.price}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      4.8
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-[2rem] bg-primary p-10 text-center text-white">
          <h2 className="text-3xl font-bold">Need Bulk Orders?</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
            Get custom pricing for hotels and hospitality businesses. Contact us for catalog and
            wholesale rates.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-white/90"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}