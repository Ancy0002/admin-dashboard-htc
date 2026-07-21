import { Link, createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { getStoreProductsByCategory } from "@/server-fns/store-products";

export const Route = createFileRoute("/_store/category/$slug")({
  loader: async ({ params }) => {
    try {
      return await getStoreProductsByCategory({ data: params.slug });
    } catch {
      return {
        category: null as string | null,
        slug: params.slug,
        products: [] as Awaited<ReturnType<typeof getStoreProductsByCategory>>["products"],
      };
    }
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, slug, products } = Route.useLoaderData();
  const title =
    category ?? slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        {products.length} product{products.length === 1 ? "" : "s"} in this category
      </p>

      {products.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <Package className="mx-auto h-14 w-14 opacity-40" aria-hidden="true" />
          <p className="mt-4">No products in this category yet.</p>
          <Link to="/shop" className="mt-6 inline-flex text-sm text-primary hover:underline">
            Browse all products →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to="/product/$id"
              params={{ id: product.id }}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md"
            >
              <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-12 w-12 text-primary/30" />
                )}
              </div>
              <div className="p-5">
                <h3 className="line-clamp-2 font-bold text-primary">{product.name}</h3>
                <p className="mt-1 font-bold text-primary">{product.priceLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
