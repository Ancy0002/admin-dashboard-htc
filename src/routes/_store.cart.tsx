import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_store/cart")({
  component: CartPage,
});

function CartPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
      <h1 className="mt-6 text-3xl font-bold text-primary">Your Cart is Empty</h1>
      <p className="mt-2 text-muted-foreground">Add some products from our shop to get started.</p>
      <a
        href="/shop"
        className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90"
      >
        Browse Shop
      </a>
    </div>
  );
}
