import { Outlet, createFileRoute } from "@tanstack/react-router";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreNavbar } from "@/components/store/StoreNavbar";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreNavbar />
      <Outlet />
      <StoreFooter />
    </div>
  );
}
