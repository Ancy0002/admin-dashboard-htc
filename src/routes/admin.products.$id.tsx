import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProductById } from "@/server-fns/products";

export const Route = createFileRoute("/admin/products/$id")({
  loader: ({ params }) => getAdminProductById({ data: params.id }),
  component: EditProductPage,
});

function EditProductPage() {
  const product = Route.useLoaderData();

  if (!product) {
    return (
      <div className="px-10 pt-10">
        <h1 className="text-4xl font-bold tracking-tight">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">This product may have been deleted.</p>
      </div>
    );
  }

  return <ProductForm mode="edit" initialData={product} />;
}
