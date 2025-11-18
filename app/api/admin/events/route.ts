import { requireAdmin } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { AdminEventReq } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdmin(req);
    const json = await req.json();
    const body = AdminEventReq.parse(json);

    const { data, error } = await supabase
      .from("city_events")
      .insert({
        name: body.name,
        category: body.category ?? null,
        venue_zone: body.venue_zone,
        start_at: body.start_at,
        end_at: body.end_at,
        impact_score: body.impact_score ?? null,
      })
      .select("id")
      .single();

    if (error) return bad("DB error", error, 500);

    return ok({ created: true, id: data.id }, 201);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    if (e.message === "Forbidden") return bad("Forbidden - admin only", null, 403);
    if (e instanceof z.ZodError) return bad("Validation failed", e.flatten(), 400);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
