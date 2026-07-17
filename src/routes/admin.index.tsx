import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CircleCheck,
  Package,
  ShoppingBag,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { getAdminDashboard } from "@/server-fns/dashboard";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    try {
      const data = await getAdminDashboard();
      return { ok: true as const, data };
    } catch (error) {
      console.error("[admin dashboard]", error);
      return {
        ok: false as const,
        error:
          error instanceof Error
            ? error.message
            : "Unable to connect to the database. Check DATABASE_URL on Vercel.",
      };
    }
  },
  component: AdminDashboard,
});

function DatabaseSetupNotice({ message }: { message: string }) {
  return (
    <div className="mx-10 mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
      <h2 className="text-lg font-semibold">Database connection required</h2>
      <p className="mt-2 text-sm">
        The admin dashboard needs your Supabase PostgreSQL connection. Add these in Vercel →
        Project Settings → Environment Variables, then redeploy:
      </p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
        <li>
          <code className="rounded bg-white/70 px-1">DATABASE_URL</code> — Supabase pooler URL
          (port 6543, with <code className="rounded bg-white/70 px-1">?pgbouncer=true</code>)
        </li>
        <li>
          <code className="rounded bg-white/70 px-1">DIRECT_URL</code> — direct Postgres URL (port
          5432)
        </li>
        <li>
          <code className="rounded bg-white/70 px-1">VITE_STORE_URL</code> — optional storefront
          link for products
        </li>
      </ul>
      <p className="mt-3 text-xs text-amber-900/80">{message}</p>
    </div>
  );
}

function AdminDashboard() {
  const result = Route.useLoaderData();

  if (!result.ok) {
    return (
      <div>
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-10 pt-10 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back — here&apos;s how your store is performing.
            </p>
          </div>
        </div>
        <DatabaseSetupNotice message={result.error} />
      </div>
    );
  }

  const { stats, recentOrders, topBestSellers } = result.data;

  const statCards = [
    {
      label: "Active Products",
      value: stats.activeProducts,
      icon: CircleCheck,
      valueClass: "text-emerald-600",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: TriangleAlert,
      valueClass: "text-destructive",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      valueClass: "text-foreground",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      valueClass: "text-foreground",
    },
    {
      label: "Customers",
      value: stats.customers,
      icon: Users,
      valueClass: "text-foreground",
    },
    {
      label: "Revenue",
      value: stats.revenue,
      icon: TrendingUp,
      valueClass: "text-foreground",
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-10 pt-10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back — here&apos;s how your store is performing.
          </p>
        </div>
      </div>

      <div className="grid gap-6 p-10 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, valueClass }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{label}</div>
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className={`mt-3 text-4xl font-bold ${valueClass}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 px-10 pb-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-border/60 py-2 text-sm"
                >
                  <div className="min-w-0 pr-4">
                    <p className="line-clamp-1 font-medium">{order.customer}</p>
                    <p className="line-clamp-1 text-muted-foreground">{order.product}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium">{order.amount}</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Top Best Sellers</h2>
            <Link to="/admin/products" className="text-xs text-primary">
              Manage
            </Link>
          </div>
          {topBestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales data yet.</p>
          ) : (
            <div className="space-y-2">
              {topBestSellers.map((product) => (
                <div
                  key={product.name}
                  className="flex justify-between border-b border-border/60 py-2 text-sm"
                >
                  <span className="line-clamp-1">{product.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {product.salesCount} sold
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
