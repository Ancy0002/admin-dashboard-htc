import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access your account to track orders and reorder favourites.
        </p>
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Sign In
          </button>
          <div className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
