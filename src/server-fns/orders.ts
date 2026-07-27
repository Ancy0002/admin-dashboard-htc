import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/admin-utils";

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
