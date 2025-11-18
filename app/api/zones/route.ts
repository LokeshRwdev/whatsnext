import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);

    const { data, error } = await supabase
      .from("zones")
      .select("id,name,geohash6,is_airport,is_charger")
      .order("name");

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
