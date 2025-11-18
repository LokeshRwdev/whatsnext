import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { UpdateZoneVisitReq } from "@/lib/zod-schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireUser(req);
    const { id } = await params;
    const json = await req.json();
    const body = UpdateZoneVisitReq.parse(json);

    const { data, error } = await supabase
      .from("zone_visits")
      .update({ left_at: body.left_at })
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
    if (e instanceof z.ZodError) return bad("Validation failed", e.flatten(), 400);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
