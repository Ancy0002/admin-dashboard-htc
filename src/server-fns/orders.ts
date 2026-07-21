import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/admin-utils";
import { calculateOrderTotals } from "@/lib/delivery";
import { GST_PERCENT } from "@/lib/store-settings";

export const getAdminOrders = createServerFn({ method: "GET" }).handler(async () => {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      address: true,
      user: { select: { name: true, email: true, mobile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    displayId: order.razorpayOrderId || order.id.slice(-8),
    customer: order.address?.name || order.user?.name || "N/A",
    phone: order.address?.mobile || order.user?.mobile || "",
    email: order.user?.email || "",
    amount: formatCurrency(order.totalAmount),
    totalAmount: order.totalAmount,
    status: order.status,
    date: formatDate(order.createdAt),
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.length,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    })),
  }));
});

type CheckoutItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
};

type CheckoutInput = {
  fullName: string;
  email: string;
  phone: string;
  pincode: string;
  address: string;
  deliveryFee: number;
  items: CheckoutItem[];
};

export const createStoreOrder = createServerFn({ method: "POST" })
  .validator((data: CheckoutInput) => data)
  .handler(async ({ data }) => {
    const fullName = data.fullName.trim();
    const email = data.email.trim().toLowerCase();
    const phone = data.phone.replace(/\D/g, "").slice(0, 10);
    const pincode = data.pincode.replace(/\D/g, "").slice(0, 6);
    const street = data.address.trim();

    if (!fullName) throw new Error("Full name is required.");
    if (!email || !email.includes("@")) throw new Error("A valid email is required.");
    if (phone.length !== 10) throw new Error("Enter a valid 10-digit phone number.");
    if (pincode.length !== 6) throw new Error("Enter a valid 6-digit pincode.");
    if (!street) throw new Error("Delivery address is required.");
    if (!data.items.length) throw new Error("Your cart is empty.");

    const itemsSubtotal = data.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const deliveryFee = Math.max(0, Number(data.deliveryFee) || 0);
    const { grandTotal } = calculateOrderTotals(itemsSubtotal, deliveryFee, GST_PERCENT);

    const order = await prisma.$transaction(async (tx) => {
      const existingUser =
        (await tx.user.findUnique({ where: { mobile: phone } })) ??
        (email
          ? await tx.user.findUnique({ where: { email } })
          : null);

      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            mobile: phone,
            email,
            name: fullName,
          },
        }));

      if (existingUser) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            name: fullName,
            email: email || user.email,
            mobile: phone,
          },
        });
      }

      const address = await tx.address.create({
        data: {
          userId: user.id,
          name: fullName,
          mobile: phone,
          street,
          city: "Hyderabad",
          state: "Telangana",
          pincode,
          isDefault: true,
        },
      });

      return tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          totalAmount: grandTotal,
          status: "PENDING",
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size || "Standard",
            })),
          },
        },
      });
    });

    return {
      orderId: order.id,
      displayId: order.id.slice(-8).toUpperCase(),
      totalAmount: order.totalAmount,
    };
  });
