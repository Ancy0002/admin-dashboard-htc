import { Link } from "@tanstack/react-router";

const shopLinks = [
  { slug: "bio-dry-amenities", label: "Bio Dry Amenities" },
  { slug: "bio-wet-amenities", label: "Bio Wet Amenities" },
  { slug: "bulk-and-brackets", label: "Bulk & Brackets" },
  { slug: "dry-amenities", label: "Dry Amenities" },
  { slug: "wet-amenities", label: "Wet Amenities" },
] as const;

export function StoreFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 text-sm md:grid-cols-4">
        <div>
          <div className="mb-2 font-montserrat text-lg font-bold">HaTikvah Care</div>
          <p className="text-muted-foreground">
            Premium hospitality amenities &amp; industrial-grade hygiene solutions for India&apos;s
            finest hotels.
          </p>
        </div>
        <div>
          <div className="mb-3 font-semibold">Shop</div>
          <ul className="space-y-2 text-muted-foreground">
            {shopLinks.map(({ slug, label }) => (
              <li key={slug}>
                <Link to="/category/$slug" params={{ slug }} className="hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-3 font-semibold">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Shop
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-3 font-semibold">Get in Touch</div>
          <p className="text-muted-foreground">
            Eshwar Nilayam, Kondapur,
            <br />
            Gachibowli, Hyderabad 500084
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl justify-between px-6 py-5 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} HaTikvah Care. All rights reserved.</div>
          <div>By EXL Marketing</div>
        </div>
      </div>
    </footer>
  );
}
