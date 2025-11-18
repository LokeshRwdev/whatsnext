import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);
    const url = new URL(req.url);
    const zoneId = url.searchParams.get("zone_id");
    const bucket = url.searchParams.get("bucket");

    if (!zoneId && !bucket) {
      return bad("Missing zone_id or bucket query parameter", null, 400);
    }

    let query = supabase
      .from("zone_context_30m")
      .select("zone_id,bucket,popularity_index");

    if (zoneId) query = query.eq("zone_id", zoneId);
    if (bucket) query = query.eq("bucket", bucket);

    query = query.order("bucket", { ascending: false }).limit(1);

    const { data, error } = await supabase
      .from("zone_context_30m")
      .select("zone_id,bucket,popularity_index")
      .eq("zone_id", zoneId || "")
      .eq("bucket", bucket || "")
      .maybeSingle();

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
