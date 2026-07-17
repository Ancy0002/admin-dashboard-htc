import { createFileRoute } from "@tanstack/react-router";
import { getAdminProductById } from "@/server-fns/products";

export const Route = createFileRoute("/admin/products/$id")({
  loader: ({ params }) => getAdminProductById({ data: params.id }),
  component: EditProductPage,
});

function EditProductPage() {
  const product = Route.useLoaderData();

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl space-y-8 p-8">
        <h1 className="text-4xl font-bold text-primary">Product Not Found</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-4xl font-bold text-primary">Edit Product</h1>
      <p className="text-muted-foreground">{product.name}</p>
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-32 w-32 rounded-xl object-cover" />
        ) : null}
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Product Name</label>
          <input
            className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2"
            defaultValue={product.name}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Category</label>
          <input
            className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2"
            defaultValue={product.category}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Price (₹)</label>
          <input
            className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2"
            defaultValue={product.price}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Status</label>
          <input
            className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2"
            defaultValue={product.isListed ? product.stockStatus : "Hidden"}
            readOnly
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Sales: {product.salesCount} · Connected to live Hatikvah database (read-only view for now).
        </p>
      </div>
    </div>
  );
}
