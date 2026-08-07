/** Mirrors prisma `OrderStatus` enum — avoid importing enums from `@prisma/client` (TS2305 in IDE). */
export const OrderStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
