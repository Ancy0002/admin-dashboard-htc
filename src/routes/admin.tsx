import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 min-h-screen min-w-0 flex-1 overflow-x-hidden bg-background">
        <Outlet />
      </main>
    </div> 
  );
}
