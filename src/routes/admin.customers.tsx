import { createFileRoute } from "@tanstack/react-router";
import { getAdminCustomers } from "@/server-fns/customers";

export const Route = createFileRoute("/admin/customers")({
  loader: () => getAdminCustomers(),
  component: AdminCustomers,
});

function AdminCustomers() {
  const customers = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Customers</h1>
        <p className="mt-1 text-muted-foreground">Registered users from Hatikvah store.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {customers.length === 0 ? (
          <p className="p-12 text-center text-muted-foreground">No customers found.</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-secondary/5 text-xs font-bold uppercase tracking-widest text-primary">
              <tr>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">Orders</th>
                <th className="px-6 py-5">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/5">
                  <td className="px-6 py-4 font-bold text-primary">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {c.email}
                    <br />
                    {c.mobile}
                  </td>
                  <td className="px-6 py-4">{c.orders}</td>
                  <td className="px-6 py-4 font-bold text-primary">{c.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
