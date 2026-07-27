import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Outlet />
    </div>
  );
}
