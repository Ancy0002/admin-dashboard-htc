import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatCurrency, formatIndianCurrency } from "@/lib/admin-utils";
import { OrderStatus } from "@prisma/client";

function formatOrderStatus(status: OrderStatus) {
  switch (status) {
    case OrderStatus.DELIVERED:
    case OrderStatus.SUCCESS:
      return "Delivered";
    case OrderStatus.SHIPPED:
      return "Processing";
    case OrderStatus.PENDING:
      return "Pending";
    case OrderStatus.FAILED:
      return "Cancelled";
    default:
      return status;
  }
}

const revenueStatuses: OrderStatus[] = [
  OrderStatus.SUCCESS,
  OrderStatus.DELIVERED,
  OrderStatus.SHIPPED,
];

export const getAdminDashboard = createServerFn({ method: "GET" }).handler(async () => {
  const [
    totalProducts,
    activeProducts,
    outOfStock,
    totalOrders,
    customerCount,
    revenueOrders,
    recentOrders,
    topBestSellers,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isListed: true, stockStatus: "IN_STOCK" } }),
    prisma.product.count({ where: { stockStatus: { not: "IN_STOCK" } } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.findMany({
      where: { status: { in: revenueStatuses } },
      select: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: { take: 1 },
        address: true,
        user: { select: { name: true } },
      },
    }),
    prisma.product.findMany({
      where: { salesCount: { gt: 0 } },
      orderBy: { salesCount: "desc" },
      take: 3,
      select: { name: true, salesCount: true },
    }),
  ]);

  const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    stats: {
      activeProducts,
      outOfStock,
      totalProducts,
      totalOrders,
      customers: customerCount,
      revenue: formatIndianCurrency(totalRevenue),
    },
    recentOrders: recentOrders.map((order) => ({
      customer: order.address?.name || order.user?.name || "Customer",
      product: order.items[0]?.productName || "Order items",
      amount: formatCurrency(order.totalAmount),
      status: formatOrderStatus(order.status),
    })),
    topBestSellers: topBestSellers.map((p) => ({
      name: p.name,
      salesCount: p.salesCount,
    })),
  };
});
