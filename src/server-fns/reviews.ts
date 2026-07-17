import { createServerFn } from "@tanstack/react-start";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/admin-utils";

export const getAdminReviews = createServerFn({ method: "GET" }).handler(async () => {
  const reviews = await prisma.review.findMany({
    include: { product: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return reviews.map((review) => ({
    id: review.id,
    customer: review.userName,
    product: review.product.name,
    rating: review.rating,
    comment: review.comment,
    date: formatDate(review.createdAt),
  }));
});
