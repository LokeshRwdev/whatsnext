import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireUser(req);
    const { id } = await params;

    const { data, error } = await supabase
      .from("ride_events")
      .select("id,event_type,occurred_at,zone_id,geohash6,battery_pct,driver_id,created_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return bad("Not found", null, 404);
      return bad("DB error", error, 500);
    }

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
