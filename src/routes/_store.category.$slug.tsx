import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_store/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">Products in this category</p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <a
            key={i}
            href={`/product/${i}`}
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-md"
          >
            <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <Package className="h-12 w-12 text-primary/30" />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-primary">
                {title} Product {i}
              </h3>
              <p className="mt-1 font-bold text-primary">₹{(99 + i * 30).toFixed(0)}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
