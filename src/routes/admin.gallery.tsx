import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

const images = [
  { id: "1", title: "Shampoo Collection", category: "Products" },
  { id: "2", title: "Body Wash Range", category: "Products" },
  { id: "3", title: "Hotel Amenities Kit", category: "Bundles" },
  { id: "4", title: "Eco Packaging", category: "Branding" },
  { id: "5", title: "Guest Welcome Set", category: "Bundles" },
  { id: "6", title: "Spa Collection", category: "Products" },
] as const;

function AdminGallery() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Gallery</h1>
          <p className="mt-1 text-muted-foreground">Manage product and brand media assets.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white hover:bg-secondary"
        >
          <ImagePlus className="h-5 w-5" />
          Upload Image
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
          >
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <ImagePlus className="h-12 w-12 text-primary/30" />
            </div>
            <div className="p-5">
              <p className="text-xs font-medium text-muted-foreground">{img.category}</p>
              <h3 className="mt-1 font-bold text-primary">{img.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
