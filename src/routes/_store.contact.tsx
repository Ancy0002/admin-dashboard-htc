import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">Get in touch for orders, catalogs, or bulk pricing.</p>
      <div className="mt-10 space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Address</p>
          <p className="mt-1 font-medium text-primary">
            Kondapur, Golden Tulip Estate, JV Hills, Gachibowli, Hyderabad, Telangana 500084
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Phone</p>
          <p className="mt-1 font-medium text-primary">+91 79954 44434</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="mt-1 font-medium text-primary">info@hatikvahcare.com</p>
        </div>
      </div>
    </div>
  );
}
