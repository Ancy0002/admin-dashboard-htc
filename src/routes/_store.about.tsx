import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-primary">About HaTikvah Care</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        HaTikvah Care is a premium hospitality supplies company based in Hyderabad, India. We
        specialize in guest amenities, toiletries, and eco-friendly products for hotels, resorts,
        serviced apartments, and Airbnb properties.
      </p>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Our mission is to elevate every guest experience with high-quality, sustainable products
        delivered at competitive wholesale prices.
      </p>
    </div>
  );
}
