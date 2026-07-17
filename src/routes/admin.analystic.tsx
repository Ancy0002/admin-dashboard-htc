import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/analystic")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Track sales performance and business insights.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-bold text-primary">Revenue Trend</h3>
          <div className="mt-6 flex h-48 items-end gap-2">
            {[55, 72, 48, 85, 60, 78, 92, 68, 80, 95, 70, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-lg bg-primary/20 transition-colors hover:bg-primary"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <h3 className="text-lg font-bold text-primary">Top Categories</h3>
          <div className="mt-6 space-y-4">
            {[
              { name: "Guest Amenities", pct: 42 },
              { name: "Bio Wet Amenities", pct: 28 },
              { name: "Bio Dry Amenities", pct: 18 },
              { name: "Coffee & Beverages", pct: 12 },
            ].map((cat) => (
              <div key={cat.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-primary">{cat.name}</span>
                  <span className="text-muted-foreground">{cat.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary/20">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
