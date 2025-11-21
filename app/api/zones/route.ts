import { ok, bad } from "@/lib/api-respond";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, user } = await createServerSupabaseClient();
  if (!user) {
    return bad("Please sign in", null, 401, "UNAUTHENTICATED");
  }

  const { data, error } = await supabase
    .from("zones")
    .select("id,name,lat,lon,center,radius_km,weight_demand,is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("[zones] fetch failed", {
      driverId: user.id,
      error,
    });
    return bad("Failed to load zones", error, 500, "DB_ERROR");
  }

  return ok({ data: data ?? [] });
}
