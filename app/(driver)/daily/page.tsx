import { redirect } from "next/navigation";
import DailyClient from "./DailyClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DailyPage() {
  const { user } = await createServerSupabaseClient();
  if (!user) {
    redirect("/login");
  }
  return <DailyClient />;
}
