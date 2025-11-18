import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);

    // Get current hour and ±1 hour buckets
    const now = new Date();
    const currentHour = now.getHours();
    const buckets = [
      `${String(currentHour - 1).padStart(2, "0")}:00`,
      `${String(currentHour).padStart(2, "0")}:00`,
      `${String(currentHour + 1).padStart(2, "0")}:00`,
    ];

    const { data, error } = await supabase
      .from("airport_wave_hourly")
      .select("bucket,arrival_wave,departure_wave")
      .in("bucket", buckets)
      .order("bucket");

    if (error) return bad("DB error", error, 500);

    return ok(data ?? []);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
