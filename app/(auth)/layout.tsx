import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border bg-background p-8 shadow-xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Patna EV Co-Pilot</p>
          <h1 className="text-2xl font-bold text-foreground">Driver access</h1>
          <p className="text-sm text-muted-foreground">
            Manage your driver account securely with Supabase Auth.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
