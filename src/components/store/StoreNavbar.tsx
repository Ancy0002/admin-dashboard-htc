import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, Phone } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function StoreNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            HT
          </span>
          <div>
            <p className="text-lg font-bold text-primary">HaTikvah Care</p>
            <p className="text-[10px] text-muted-foreground">Premium Hospitality Supplies</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-sm font-bold text-primary" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+917995444434"
            className="hidden items-center gap-1 text-sm font-medium text-primary sm:flex"
          >
            <Phone className="h-4 w-4" />
            +91 79954 44434
          </a>
          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
          </Link>
          <button type="button" className="rounded-lg p-2 text-primary md:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
