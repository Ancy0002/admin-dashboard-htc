import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Image,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
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
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 p-6">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary font-montserrat text-sm font-bold text-primary-foreground">
          HT
        </div>
        <div>
          <div className="font-montserrat text-lg font-bold leading-tight">HaTikvah Care</div>
          <div className="text-xs text-muted-foreground">Admin Portal</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={"exact" in item && item.exact ? { exact: true } : undefined}
            activeProps={{
              className:
                "flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors",
            }}
            inactiveProps={{
              className:
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-accent",
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4", isActive ? "" : "")} aria-hidden="true" />
                {item.label}
              </>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-3">
        <Link
          to="/"
          className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          ← View Storefront
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-semibold">
            AD
          </div>
          <div className="text-sm">
            <div className="font-semibold leading-tight">Admin User</div>
            <div className="text-xs text-muted-foreground">Store Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
