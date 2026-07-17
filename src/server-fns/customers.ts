import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/admin-utils";
import { OrderStatus } from "@prisma/client";

export const getAdminCustomers = createServerFn({ method: "GET" }).handler(async () => {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: OrderStatus.SUCCESS },
        select: { totalAmount: true },
      },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name || "Guest",
    email: user.email || `${user.mobile}@hatikvah.local`,
    mobile: user.mobile,
    orders: user._count.orders,
    spent: formatCurrency(user.orders.reduce((sum, o) => sum + o.totalAmount, 0)),
  }));
});
