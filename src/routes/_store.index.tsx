import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
