import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Image,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/gallery", label: "Gallery", icon: Image },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/analystic", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-white">
            HT
          </span>
          HaTikvah
        </h1>
        <p className="mt-1 text-xs font-medium text-muted-foreground">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={"exact" in item && item.exact ? { exact: true } : undefined}
            activeProps={{
              className:
                "group flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white shadow-md shadow-primary/20",
            }}
            inactiveProps={{
              className:
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/10 hover:text-primary",
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-primary",
                  )}
                />
                {item.label}
              </>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              AD
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Admin User</p>
              <p className="text-xs text-muted-foreground">Store Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
