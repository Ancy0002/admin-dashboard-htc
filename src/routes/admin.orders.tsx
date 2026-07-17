import { createFileRoute } from "@tanstack/react-router";
import { Filter, Search } from "lucide-react";
import { getAdminOrders } from "@/server-fns/orders";

export const Route = createFileRoute("/admin/orders")({
  loader: () => getAdminOrders(),
  component: AdminOrders,
});

const statusStyles: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-600 border-emerald-100",
  DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  SHIPPED: "bg-blue-50 text-blue-600 border-blue-100",
  PENDING: "bg-orange-50 text-orange-600 border-orange-100",
  FAILED: "bg-gray-50 text-gray-600 border-gray-100",
};

function AdminOrders() {
  const orders = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Orders</h1>
        <p className="mt-1 text-muted-foreground">Live orders from Hatikvah store.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by order ID or customer..."
            className="w-full rounded-xl border border-border bg-secondary/5 py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border border-border bg-secondary/5 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Success</option>
            <option>Failed</option>
            <option>Delivered</option>
          </select>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-bold transition-colors hover:bg-secondary/5"
          >
            <Filter className="h-[18px] w-[18px]" />
            More Filters
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {orders.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No orders found in database.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-secondary/5 text-xs font-bold uppercase tracking-widest text-primary">
              <tr>
                <th className="px-6 py-5">Order Details</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Amount</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-secondary/5">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold uppercase tracking-wider text-primary">
                      {order.displayId}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{order.itemCount} items</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{order.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status] || statusStyles.FAILED}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
