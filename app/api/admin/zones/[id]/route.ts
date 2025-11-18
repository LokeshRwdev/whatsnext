import { requireAdmin } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { AdminZoneReq } from "@/lib/zod-schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin(req);
    const { id } = await params;
    const json = await req.json();
    const body = AdminZoneReq.partial().parse(json);

    // Build update object
    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.is_airport !== undefined) updates.is_airport = body.is_airport;
    if (body.is_charger !== undefined) updates.is_charger = body.is_charger;
    if (body.meta !== undefined) updates.meta = body.meta;

    // If lat/lon provided, update center point
    if (body.lat !== undefined && body.lon !== undefined) {
      const { error: updateError } = await supabase.rpc("exec_sql", {
        sql: `
          UPDATE zones
          SET center = ST_SetSRID(ST_MakePoint($1, $2), 4326),
              name = COALESCE($3, name),
              is_airport = COALESCE($4, is_airport),
              is_charger = COALESCE($5, is_charger),
              meta = COALESCE($6, meta)
          WHERE id = $7
        `,
        params: [
          body.lon,
          body.lat,
          body.name ?? null,
          body.is_airport ?? null,
          body.is_charger ?? null,
          body.meta ? JSON.stringify(body.meta) : null,
          id,
        ],
      });

      if (updateError) return bad("DB error", updateError, 500);
    } else if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("zones")
        .update(updates)
        .eq("id", id);

      if (updateError) return bad("DB error", updateError, 500);
    }

    // Fetch updated zone
    const { data, error } = await supabase
      .from("zones")
      .select("id,name,geohash6,is_airport,is_charger,meta")
      .eq("id", id)
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
