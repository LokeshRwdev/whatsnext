import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);

    const { data, error } = await supabase
      .from("weather_obs")
      .select("hour,temp_c,humidity,wind_kmh,rain_mm")
      .order("hour", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
