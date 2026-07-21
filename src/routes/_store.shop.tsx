import { Link, createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { getStoreProducts } from "@/server-fns/store-products";

export const Route = createFileRoute("/_store/shop")({
  loader: async () => {
    try {
      return { products: await getStoreProducts() };
    } catch {
      return { products: [] as Awaited<ReturnType<typeof getStoreProducts>> };
    }
  },
  component: ShopPage,
});

function ShopPage() {
  const { products } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">Shop</h1>
      <p className="mt-2 text-muted-foreground">Browse our full product catalog</p>

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <Package className="mx-auto h-14 w-14 opacity-40" aria-hidden="true" />
          <p className="mt-4">No products listed yet. Check back soon.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to="/product/$id"
              params={{ id: product.id }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <Package className="h-14 w-14 text-primary/30 transition-transform group-hover:scale-110" />
                )}
                {product.outOfStock ? (
                  <span className="absolute top-3 right-3 rounded-md bg-destructive px-2 py-1 text-[11px] font-medium text-destructive-foreground">
                    Out of Stock
                  </span>
                ) : null}
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{product.category}</p>
                <h3 className="mt-1 line-clamp-2 font-bold text-primary">{product.name}</h3>
                <p className="mt-2 text-lg font-bold text-primary">{product.priceLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
