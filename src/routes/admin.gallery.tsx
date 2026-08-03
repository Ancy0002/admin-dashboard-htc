import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { getAdminProducts } from "@/server-fns/products";

export const Route = createFileRoute("/admin/gallery")({
  loader: () => getAdminProducts(),
  component: AdminGallery,
});

function AdminGallery() {
  const products = Route.useLoaderData();
  const images = products
    .filter((p) => Boolean(p.image?.trim()))
    .map((p) => ({
      id: p.id,
      title: p.name,
      category: p.category,
      image: p.image,
    }));

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Gallery</h1>
          <p className="mt-1 text-muted-foreground">
            Product images from the shared database (same DATABASE_URL as hatikvahcare.com).
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white hover:bg-secondary"
        >
          <ImagePlus className="h-5 w-5" />
          Add Product Image
        </Link>
      </div>

      {images.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
          No product images in the database yet. Add a product with an image to see it here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <Link
              key={img.id}
              to="/admin/products/$id"
              params={{ id: img.id }}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/40"
            >
              <div className="flex h-48 items-center justify-center bg-secondary/20">
                <img src={img.image} alt={img.title} className="h-full w-full object-contain p-4" />
              </div>
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground">{img.category}</p>
                <h3 className="mt-1 line-clamp-2 font-bold text-primary">{img.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
