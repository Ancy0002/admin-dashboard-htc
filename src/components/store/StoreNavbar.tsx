import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  LogOut,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";
import { clearStoreSession, getStoreSession, type StoreSession } from "@/lib/store-auth";

const navLinks = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function StoreNavbar() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [session, setSession] = useState<StoreSession | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSession(getStoreSession());
  }, []);

  useEffect(() => {
    if (!accountOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const handleSignOut = () => {
    clearStoreSession();
    setSession(null);
    setAccountOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary font-montserrat text-sm font-bold text-primary-foreground">
            H
          </div>
          <div className="leading-tight">
            <div className="font-montserrat text-lg font-bold">HaTikvah Care</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              EXL Marketing • Hyderabad
            </div>
          </div>
        </Link>

        <nav className="ml-4 hidden items-center gap-7 lg:flex">
          <Link
            to="/"
            className="text-[15px] text-foreground/80 transition-colors hover:text-foreground"
            activeProps={{ className: "text-[15px] font-semibold text-primary transition-colors" }}
          >
            Home
          </Link>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[15px] text-foreground/80 hover:text-foreground"
            >
              Categories <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-[15px] text-foreground/80 transition-colors hover:text-foreground"
              activeProps={{ className: "text-[15px] font-semibold text-primary transition-colors" }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="relative mx-2 hidden max-w-md flex-1 md:flex">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            placeholder="Search hotel supplies, products, and brands..."
            className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-accent"
              aria-label="Account"
              aria-expanded={accountOpen}
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </button>
            {accountOpen ? (
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
                {session ? (
                  <>
                    <div className="px-3 py-2 text-xs text-muted-foreground">Signed in as</div>
                    <div className="px-3 pb-2 text-sm font-medium">{session.maskedEmail}</div>
                    <div className="my-1 border-t border-border" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setAccountOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
                    >
                      Create Account
                    </Link>
                  </>
                )}
                <div className="my-1 border-t border-border" />
                <Link
                  to="/admin"
                  onClick={() => setAccountOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-accent"
                >
                  Admin Panel
                </Link>
              </div>
            ) : null}
          </div>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-accent"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
