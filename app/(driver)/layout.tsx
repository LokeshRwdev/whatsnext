import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { BottomNav } from "@/components/BottomNav";
import { createServerSupabaseClient, loadProfile } from "@/lib/supabase/server";

async function DriverLayoutContent({ children }: { children: ReactNode }) {
  const { supabase, user } = await createServerSupabaseClient();
  if (!user) {
    redirect("/login");
  }
  const profile = await loadProfile(supabase, user.id);

  return (
    <div className="flex flex-col h-screen">
      <NavBar userEmail={user.email} displayName={profile?.full_name ?? user.fullName} />
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <DriverLayoutContent>{children}</DriverLayoutContent>
    </Suspense>
  );
}
