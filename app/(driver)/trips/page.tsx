import { redirect } from "next/navigation";
import TripsClient from "./TripsClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function TripsPage() {
  const { user } = await createServerSupabaseClient();
  if (!user) {
    redirect("/login");
  }
  return <TripsClient />;
}
