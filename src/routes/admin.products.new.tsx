import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProductCategories } from "@/server-fns/products";

export const Route = createFileRoute("/admin/products/new")({
  loader: () => getAdminProductCategories(),
  component: NewProductPage,
});

function NewProductPage() {
  const categories = Route.useLoaderData();
  return <ProductForm mode="create" categories={categories} />;
}
