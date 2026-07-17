import { Link } from "@tanstack/react-router";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-primary">HaTikvah Care</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium hospitality amenities and guest supplies for hotels, resorts, and serviced
              apartments.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-primary">Quick Links</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/shop" className="hover:text-primary">
                Shop
              </Link>
              <Link to="/about" className="hover:text-primary">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-primary">Contact</h4>
            <p className="mt-3 text-sm text-muted-foreground">
              Kondapur, Hyderabad, Telangana 500084
              <br />
              +91 79954 44434
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HaTikvah Care. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
