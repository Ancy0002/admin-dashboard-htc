import { useMemo, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Download,
  EllipsisVertical,
  Eye,
  EyeOff,
  Funnel,
  Globe,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteAdminProduct,
  getAdminProductStats,
  getAdminProducts,
} from "@/server-fns/products";

const STORE_URL = import.meta.env.VITE_STORE_URL ?? "https://hatikvah.vercel.app";

export const Route = createFileRoute("/admin/products/")({
  loader: async () => {
    const [products, stats] = await Promise.all([getAdminProducts(), getAdminProductStats()]);
    return { products, stats };
  },
  component: AdminProducts,
});

function AdminProducts() {
  const { products, stats } = Route.useLoaderData();
  const router = useRouter();
  const deleteProduct = useServerFn(deleteAdminProduct);

  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortId.includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [products, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteProduct({ data: id });
      await router.invalidate();
    } catch {
      window.alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const header = ["ID", "Name", "Category", "Price Range", "Visibility", "Sales"];
    const rows = filtered.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.priceRange,
      p.visibility,
      String(p.salesCount),
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 border-b border-border/60 px-10 pt-10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">Manage your e-commerce product catalog.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <div className="space-y-6 p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Total Products</div>
            <div className="mt-3 text-4xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Active Listings</div>
            <div className="mt-3 text-4xl font-bold text-emerald-600">{stats.active}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground">Out of Stock</div>
            <div className="mt-3 text-4xl font-bold text-destructive">{stats.outOfStock}</div>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border-0 bg-input py-3 pl-11 pr-4 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
          >
            <Funnel className="h-4 w-4" aria-hidden="true" />
            Filter
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {filtered.length === 0 ? (
            <p className="p-12 text-center text-muted-foreground">
              {search ? "No products match your search." : "No products found in database."}
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 text-left font-medium">Product</th>
                  <th className="p-4 text-left font-medium">Category</th>
                  <th className="p-4 text-left font-medium">Price Range</th>
                  <th className="p-4 text-left font-medium">Visibility</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary/50">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold text-primary/30">HT</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="line-clamp-1 font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground uppercase">
                            {product.shortId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{product.category}</td>
                    <td className="p-4 text-sm font-medium">{product.priceRange}</td>
                    <td className="p-4">
                      {product.isListed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-600">
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          LISTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          <EyeOff className="h-3 w-3" aria-hidden="true" />
                          HIDDEN
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(`${STORE_URL}/product/${product.id}`, "_blank", "noopener,noreferrer")
                          }
                          className="rounded-md p-2 hover:bg-accent"
                          title="Toggle visibility"
                        >
                          <Globe className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <Link
                          to="/admin/products/$id"
                          params={{ id: product.id }}
                          className="rounded-md p-2 hover:bg-accent"
                          title="Edit product"
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="rounded-md p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-2 hover:bg-accent"
                          title="More options"
                        >
                          <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
