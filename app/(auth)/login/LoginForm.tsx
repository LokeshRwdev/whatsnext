"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

type LoginFormProps = {
  redirectedFrom?: string;
};

export function LoginForm({ redirectedFrom }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (result.error) {
      const message =
        result.error.message?.toLowerCase().includes("invalid login") || result.error.status === 400
          ? "Invalid email or password"
          : result.error.message ?? "Unable to sign in";
      setError(message);
      return;
    }

    const destination = redirectedFrom && redirectedFrom.startsWith("/") ? redirectedFrom : "/";
    router.push(destination);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email address</label>
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="driver@example.com"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
        <p className="text-xs text-muted-foreground">
          Passwords are processed securely by Supabase Auth and never stored locally.
        </p>
      </div>
      {redirectedFrom && (
        <p className="rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Please sign in to continue to <strong>{redirectedFrom}</strong>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}
