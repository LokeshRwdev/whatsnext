"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || undefined },
      },
    });

    if (error) {
      const friendly =
        error.message?.toLowerCase().includes("already registered") || error.status === 400
          ? "This email is already registered. Try logging in instead."
          : error.message ?? "Unable to sign up";
      setError(friendly);
      setSubmitting(false);
      return;
    }

    if (data.user && data.session) {
      try {
        await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName || null });
      } catch (profileError) {
        console.warn("[signup] profile upsert failed", profileError);
      }
    }

    setSubmitting(false);
    if (!data.session) {
      setSuccessMessage("Check your email to confirm your account before signing in.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full name (optional)</label>
        <Input
          type="text"
          name="full_name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Patna Driver"
        />
      </div>
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
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a strong password"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm password</label>
        <Input
          type="password"
          name="confirm_password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirm password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {successMessage && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{successMessage}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </div>
    </form>
  );
}
