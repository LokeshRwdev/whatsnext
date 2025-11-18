import { requireAdmin } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { AdminEventReq } from "@/lib/zod-schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin(req);
    const { id } = await params;
    const json = await req.json();
    const body = AdminEventReq.partial().parse(json);

    // Build update object
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.category !== undefined) updates.category = body.category;
    if (body.venue_zone !== undefined) updates.venue_zone = body.venue_zone;
    if (body.start_at !== undefined) updates.start_at = body.start_at;
    if (body.end_at !== undefined) updates.end_at = body.end_at;
    if (body.impact_score !== undefined) updates.impact_score = body.impact_score;

    const { data, error } = await supabase
      .from("city_events")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return bad("Not found", null, 404);
      return bad("DB error", error, 500);
    }

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    if (e.message === "Forbidden") return bad("Forbidden - admin only", null, 403);
    if (e instanceof z.ZodError) return bad("Validation failed", e.flatten(), 400);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
