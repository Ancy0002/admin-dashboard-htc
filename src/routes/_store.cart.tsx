import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { calculateOrderTotals } from "@/lib/delivery";
import { FREE_DELIVERY_ABOVE, GST_PERCENT } from "@/lib/store-settings";
import { formatIndianCurrency } from "@/lib/admin-utils";
import { calculateDeliveryFromPincode } from "@/server-fns/delivery";
import { createStoreOrder } from "@/server-fns/orders";

export const Route = createFileRoute("/_store/cart")({
  component: CartPage,
});

type DeliveryQuote = {
  distanceKm: number;
  deliveryFee: number;
  freeDelivery: boolean;
};

function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const calculateDelivery = useServerFn(calculateDeliveryFromPincode);
  const createOrder = useServerFn(createStoreOrder);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [deliveryError, setDeliveryError] = useState("");
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const itemsSubtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const deliveryFee = deliveryQuote?.deliveryFee ?? 0;
  const { taxableValue, gst, grandTotal } = calculateOrderTotals(
    itemsSubtotal,
    deliveryFee,
    GST_PERCENT,
  );

  useEffect(() => {
    const cleaned = pincode.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length !== 6 || itemsSubtotal <= 0) {
      setDeliveryQuote(null);
      setDeliveryError("");
      return;
    }

    const timer = window.setTimeout(async () => {
      setCheckingPincode(true);
      setDeliveryError("");
      try {
        const result = await calculateDelivery({
          data: { pincode: cleaned, itemsSubtotal },
        });
        setDeliveryQuote({
          distanceKm: result.distanceKm,
          deliveryFee: result.deliveryFee,
          freeDelivery: result.freeDelivery,
        });
      } catch (error) {
        setDeliveryQuote(null);
        setDeliveryError(
          error instanceof Error ? error.message : "Unable to calculate delivery distance.",
        );
      } finally {
        setCheckingPincode(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [pincode, itemsSubtotal, calculateDelivery]);

  const handleCheckout = async () => {
    if (!deliveryQuote) {
      toast.error("Enter a valid pincode to calculate delivery.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        data: {
          fullName,
          email,
          phone,
          pincode,
          address,
          deliveryFee: deliveryQuote.deliveryFee,
          items: items.map((item) => ({
            productId: item.productId || item.id.split(":")[0],
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size || "Standard",
          })),
        },
      });
      clearCart();
      setOrderId(result.displayId);
      toast.success(`Order ${result.displayId} placed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-16 w-16 text-primary" />
        <h1 className="mt-6 text-3xl font-bold text-primary">Order placed</h1>
        <p className="mt-2 text-muted-foreground">
          Your order <span className="font-semibold text-foreground">#{orderId}</span> has been
          received. We&apos;ll confirm delivery shortly.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="mt-6 text-3xl font-bold text-primary">Your Cart is Empty</h1>
        <p className="mt-2 text-muted-foreground">Add some products from our shop to get started.</p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground hover:opacity-90"
        >
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Cart &amp; Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your items and enter delivery details.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg">Your items</h2>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.size ? `Size: ${item.size}` : null}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-accent"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeItem(item.id)}
                          className="ml-2 grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold">
                      {formatIndianCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold text-lg">Delivery Details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Distance is calculated automatically from your pincode.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 500084"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2.5"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium">Full Delivery Address</label>
                <textarea
                  rows={3}
                  placeholder="Street, area, landmark, city"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-input px-4 py-2.5"
                />
                {checkingPincode ? (
                  <p className="mt-2 text-xs text-muted-foreground">Calculating distance...</p>
                ) : null}
                {deliveryError ? (
                  <p className="mt-2 text-xs text-destructive">{deliveryError}</p>
                ) : null}
                {deliveryQuote ? (
                  <p className="mt-2 text-xs text-primary">
                    ✓ Approx. {deliveryQuote.distanceKm} km from store — delivery{" "}
                    {deliveryQuote.freeDelivery
                      ? "FREE"
                      : formatIndianCurrency(deliveryQuote.deliveryFee)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sticky top-24 h-fit rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-baseline justify-between">
                <div className="text-foreground">Items subtotal</div>
                <div className="font-medium">{formatIndianCurrency(itemsSubtotal)}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-foreground">Courier Service</div>
                  {deliveryQuote ? (
                    <div className="text-xs text-muted-foreground">{deliveryQuote.distanceKm} km</div>
                  ) : null}
                </div>
                <div className="font-medium">
                  {deliveryQuote
                    ? deliveryQuote.freeDelivery
                      ? "FREE"
                      : formatIndianCurrency(deliveryQuote.deliveryFee)
                    : "—"}
                </div>
              </div>
              <div className="my-3 border-t border-border" />
              <div className="flex items-baseline justify-between">
                <div className="text-foreground">Taxable value</div>
                <div className="font-medium">{formatIndianCurrency(taxableValue)}</div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-foreground">GST ({GST_PERCENT}%)</div>
                <div className="font-medium">{formatIndianCurrency(gst)}</div>
              </div>
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="text-lg font-bold">Grand total</span>
              <span className="text-xl font-bold">{formatIndianCurrency(grandTotal)}</span>
            </div>
            <button
              type="button"
              disabled={!deliveryQuote || !address.trim() || !fullName.trim() || submitting}
              onClick={() => void handleCheckout()}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Placing order..." : "Proceed to checkout"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Free delivery on orders above {formatIndianCurrency(FREE_DELIVERY_ABOVE)}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
