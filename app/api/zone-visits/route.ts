import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { CreateZoneVisitReq } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser(req);
    const json = await req.json();
    const body = CreateZoneVisitReq.parse(json);

    const { data, error } = await supabase
      .from("zone_visits")
      .insert({
        driver_id: user.id,
        zone_id: body.zone_id,
        arrived_at: body.arrived_at ?? new Date().toISOString(),
        context: body.context ?? null,
      })
      .select("id")
      .single();

    if (error) return bad("DB error", error, 500);

    return ok({ created: true, id: data.id }, 201);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    if (e instanceof z.ZodError) return bad("Validation failed", e.flatten(), 400);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);

    const { data, error } = await supabase
      .from("zone_visits")
      .select("id,driver_id,zone_id,arrived_at,left_at,context,created_at")
      .order("arrived_at", { ascending: false })
      .limit(limit);

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
