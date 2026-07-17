import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Settings</h1>
        <p className="mt-1 text-muted-foreground">Configure your store preferences.</p>
      </div>
      <div className="space-y-6">
        {[
          { title: "Store Information", fields: ["Store Name", "Contact Email", "Phone Number"] },
          { title: "Shipping", fields: ["Default Shipping Rate", "Free Shipping Threshold"] },
          { title: "Notifications", fields: ["Order Alerts", "Low Stock Alerts"] },
        ].map((section) => (
          <div key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-primary">{section.title}</h3>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-muted-foreground">{field}</label>
                  <input
                    className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue={field === "Store Name" ? "HaTikvah Care" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="rounded-2xl bg-primary px-8 py-3 font-bold text-white hover:bg-secondary"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
