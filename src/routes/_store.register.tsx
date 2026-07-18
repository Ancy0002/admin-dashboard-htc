import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">It only takes a moment.</p>
        <form
          className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input className="w-full rounded-lg border border-border bg-input px-4 py-2.5" />
          </div>
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
            <p className="mt-1 text-xs text-muted-foreground">Minimum 6 characters.</p>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90"
          >
            Create Account
          </button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
