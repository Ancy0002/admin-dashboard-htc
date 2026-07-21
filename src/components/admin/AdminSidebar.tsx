import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouteContext, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import { clearCachedAdminAuth } from "@/lib/admin-auth-cache";
import { clearStoreSession } from "@/lib/store-auth";
import { STORE_URL } from "@/lib/store-url";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/server-fns/store-auth";

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

function pathMatches(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useServerFn(logoutAdmin);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { admin } = useRouteContext({ from: "/admin" });
  const maskedEmail = admin.maskedEmail;

  // Destination path updates as soon as navigation starts (before loaders finish).
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const activePath = optimisticPath ?? pathname;

  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = async () => {
    clearCachedAdminAuth();
    try {
      await logout();
    } catch {
      // Still clear local UI state and leave admin.
    }
    clearStoreSession();
    setMenuOpen(false);
    await navigate({ to: "/login" });
  };

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
        {navItems.map((item) => {
          const active = pathMatches(
            activePath,
            item.to,
            "exact" in item ? item.exact : false,
          );

          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              preloadDelay={0}
              onClick={() => setOptimisticPath(item.to)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-foreground/80 hover:bg-accent",
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          ← View Storefront
        </a>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="flex w-full items-center gap-3 rounded-xl bg-secondary/60 p-3 text-left hover:bg-secondary"
          >
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-semibold">
              AD
            </div>
            <div className="min-w-0 text-sm">
              <div className="font-semibold leading-tight">Admin User</div>
              <div className="truncate text-xs text-muted-foreground">
                {maskedEmail ?? "Store Manager"}
              </div>
            </div>
          </button>
          {menuOpen ? (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-xl border border-border bg-card p-1 shadow-lg">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
