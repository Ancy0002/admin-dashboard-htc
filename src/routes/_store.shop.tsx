import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/_store/shop")({
  component: ShopPage,
});

const products = [
  { id: "1", name: "Green Apple Shampoo", price: "₹129", category: "Guest Amenities" },
  { id: "2", name: "Apricot Body Wash", price: "₹190", category: "Bio Wet" },
  { id: "3", name: "Lavender Conditioner", price: "₹149", category: "Guest Amenities" },
  { id: "4", name: "Citrus Hand Wash", price: "₹89", category: "Bio Dry" },
  { id: "5", name: "Rose Body Lotion", price: "₹175", category: "Guest Amenities" },
  { id: "6", name: "Mint Mouthwash", price: "₹99", category: "Bio Wet" },
  { id: "7", name: "Aloe Vera Soap", price: "₹65", category: "Bio Dry" },
  { id: "8", name: "Vanilla Body Mist", price: "₹210", category: "Guest Amenities" },
] as const;

function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">Shop</h1>
      <p className="mt-2 text-muted-foreground">Browse our full product catalog</p>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <a
            key={p.id}
            href={`/product/${p.id}`}
            className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
              <Package className="h-14 w-14 text-primary/30 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <h3 className="mt-1 font-bold text-primary">{p.name}</h3>
              <p className="mt-2 text-lg font-bold text-primary">{p.price}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
