import { useMemo, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  EllipsisVertical,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Pen,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
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
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div className="animate-in fade-in space-y-8 duration-500">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-montserrat text-4xl font-bold tracking-tight text-primary">
              Products
            </h1>
            <p className="mt-1 text-muted-foreground">Manage your e-commerce product catalog.</p>
          </div>
          <Link
            to="/admin/products/new"
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-secondary"
          >
            <Plus className="h-5 w-5" />
            Add Product
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
            <p className="mt-2 text-3xl font-bold text-teal-600">{stats.active}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-500">{stats.outOfStock}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-border bg-secondary/5 py-2 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium transition-colors hover:bg-secondary/5"
            >
              <Filter className="h-[18px] w-[18px]" />
              Filter
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 font-medium transition-colors hover:bg-secondary/5"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-visible rounded-3xl border border-border bg-card shadow-sm">
          {filtered.length === 0 ? (
            <p className="p-12 text-center text-muted-foreground">
              {search ? "No products match your search." : "No products found in database."}
            </p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead className="bg-secondary/5 text-sm font-bold uppercase tracking-wider text-primary">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price Range</th>
                  <th className="px-6 py-4">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-secondary/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/10">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-primary">{product.name}</span>
                            {product.isBestSeller ? (
                              <Star
                                className="h-3 w-3 text-amber-400"
                                fill="currentColor"
                                stroke="currentColor"
                              />
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="font-bold uppercase tracking-wider">
                              {product.shortId}
                            </span>
                            {product.salesCount > 0 ? (
                              <span className="flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600">
                                <TrendingUp className="h-2.5 w-2.5" />
                                {product.salesCount} sales
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {product.priceRange}
                    </td>
                    <td className="px-6 py-4">
                      {product.isListed ? (
                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                          <Eye className="h-3 w-3" />
                          Listed
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          <EyeOff className="h-3 w-3" />
                          Hidden
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex items-center gap-1">
                          <a
                            href={`${STORE_URL}/product/${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-2 text-teal-600 transition-all hover:bg-teal-50"
                            title="View on website"
                          >
                            <Globe className="h-4 w-4" />
                          </a>
                          <Link
                            to="/admin/products/$id"
                            params={{ id: product.id }}
                            className="rounded-lg p-2 text-indigo-600 transition-all hover:bg-indigo-50"
                            title="Edit product"
                          >
                            <Pen className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="rounded-lg p-2 text-red-500 transition-all hover:bg-red-50 disabled:opacity-50"
                            title="Delete product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-secondary/10"
                            title="More options"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </button>
                        </div>
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
