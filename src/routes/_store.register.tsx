import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-primary">Create Account</h1>
      <p className="mt-2 text-muted-foreground">Register to shop and track your orders.</p>
      <form className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Full Name</label>
          <input className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Email</label>
          <input type="email" className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">Password</label>
          <input type="password" className="w-full rounded-xl border border-border bg-secondary/5 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <button type="button" className="w-full rounded-xl bg-primary py-3 font-bold text-white hover:bg-primary/90">
          Create Account
        </button>
      </form>
    </div>
  );
}
