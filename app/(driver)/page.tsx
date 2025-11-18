import { redirect } from "next/navigation";
import DriverHomeClient from "./DriverHomeClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DriverHomePage() {
  const { user } = await createServerSupabaseClient();
  if (!user) {
    redirect("/login");
  }
  return <DriverHomeClient />;
}
