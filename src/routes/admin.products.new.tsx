import { createFileRoute } from "@tanstack/react-router";
import { AddProductForm } from "@/components/admin/AddProductForm";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  return (
    <div className="mx-auto max-w-7xl p-8">
      <AddProductForm />
    </div>
  );
}
