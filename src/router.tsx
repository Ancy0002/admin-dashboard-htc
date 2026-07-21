import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 0,
    // Keep preloaded admin routes warm so sidebar clicks feel instant.
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 10_000,
  });

  return router;
};
