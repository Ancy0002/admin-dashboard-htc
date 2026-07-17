import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { getAdminReviews } from "@/server-fns/reviews";

export const Route = createFileRoute("/admin/reviews")({
  loader: () => getAdminReviews(),
  component: AdminReviews,
});

function AdminReviews() {
  const reviews = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Reviews</h1>
        <p className="mt-1 text-muted-foreground">Live customer reviews from Hatikvah database.</p>
      </div>
      {reviews.length === 0 ? (
        <p className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
          No reviews yet.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-primary">{review.customer}</p>
                  <p className="text-sm text-muted-foreground">{review.product}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">{review.comment}</p>
              <p className="mt-2 text-xs text-muted-foreground">{review.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
