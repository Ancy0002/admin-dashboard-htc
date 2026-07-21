import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  clearCachedAdminAuth,
  getCachedAdminAuth,
  setCachedAdminAuth,
} from "@/lib/admin-auth-cache";
import { requireAdminAuth } from "@/server-fns/store-auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const cached = typeof window !== "undefined" ? getCachedAdminAuth() : null;
    if (cached) {
      return { admin: cached };
    }

    try {
      const admin = await requireAdminAuth();
      if (typeof window !== "undefined") {
        setCachedAdminAuth(admin);
      }
      return { admin };
    } catch {
      clearCachedAdminAuth();
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[oklch(0.985_0.005_95)]">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
