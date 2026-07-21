import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { getStoreProductById } from "@/server-fns/store-products";

export const Route = createFileRoute("/_store/product/$id")({
  loader: async ({ params }) => {
    try {
      return { product: await getStoreProductById({ data: params.id }) };
    } catch {
      return { product: null };
    }
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSizeId, setSelectedSizeId] = useState(product?.sizes[0]?.id ?? "");

  useEffect(() => {
    setSelectedSizeId(product?.sizes[0]?.id ?? "");
  }, [product?.id]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 text-3xl font-bold text-primary">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This item may be hidden or no longer available.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground hover:opacity-90"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const selectedSize =
    product.sizes.find((size) => size.id === selectedSizeId) ?? product.sizes[0] ?? null;

  const handleAddToCart = () => {
    if (product.outOfStock) {
      toast.error("This product is out of stock.");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }

    addItem({
      id: `${product.id}:${selectedSize.size}`,
      productId: product.id,
      name: product.name,
      price: selectedSize.price,
      size: selectedSize.size,
      image: product.image,
    });
    toast.success("Added to cart");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex h-80 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/10 lg:h-96">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <Package className="h-24 w-24 text-primary/30" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{product.category}</p>
          <h1 className="mt-2 text-4xl font-bold text-primary">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold text-primary">
            {selectedSize?.priceLabel ?? "—"}
          </p>
          {product.outOfStock ? (
            <p className="mt-2 text-sm font-medium text-destructive">Out of Stock</p>
          ) : null}
          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description ||
              product.excerpt ||
              "Premium hospitality amenity designed for hotels and resorts."}
          </p>

          {product.sizes.length > 0 ? (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedSize?.id === size.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.outOfStock || !selectedSize}
            className="mt-8 rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
