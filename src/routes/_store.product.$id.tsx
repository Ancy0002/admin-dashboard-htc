import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_store/product/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/10 lg:h-96">
          <Package className="h-24 w-24 text-primary/30" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Guest Amenities</p>
          <h1 className="mt-2 text-4xl font-bold text-primary">Product #{id}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">₹129</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Premium hospitality amenity designed for hotels and resorts. Eco-friendly packaging
            with a refreshing fragrance guests love.
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
