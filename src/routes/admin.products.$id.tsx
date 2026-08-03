import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProductById, getAdminProductCategories } from "@/server-fns/products";

export const Route = createFileRoute("/admin/products/$id")({
  loader: async ({ params }) => {
    const [product, categories] = await Promise.all([
      getAdminProductById({ data: params.id }),
      getAdminProductCategories(),
    ]);
    return { product, categories };
  },
  component: EditProductPage,
});

function EditProductPage() {
  const { product, categories } = Route.useLoaderData();

  if (!product) {
    return (
      <div className="px-10 pt-10">
        <h1 className="text-4xl font-bold tracking-tight">Product Not Found</h1>
        <p className="mt-2 text-muted-foreground">This product may have been deleted.</p>
      </div>
    );
  }

  return <ProductForm mode="edit" initialData={product} categories={categories} />;
}
