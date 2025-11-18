import { requireAdmin, requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { AdminZoneReq } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const { supabase } = await requireAdmin(req);
    const json = await req.json();
    const body = AdminZoneReq.parse(json);

    // Insert zone with ST_SetSRID and ST_MakePoint for PostGIS
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: `
        INSERT INTO zones (name, center, is_airport, is_charger, meta)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6)
        RETURNING id
      `,
      params: [
        body.name,
        body.lon,
        body.lat,
        body.is_airport ?? false,
        body.is_charger ?? false,
        JSON.stringify(body.meta ?? {}),
      ],
    });

    if (error) return bad("DB error", error, 500);

    return ok({ created: true, id: data?.[0]?.id }, 201);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    if (e.message === "Forbidden") return bad("Forbidden - admin only", null, 403);
    if (e instanceof z.ZodError) return bad("Validation failed", e.flatten(), 400);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);

    const { data, error } = await supabase
      .from("zones")
      .select("id,name,geohash6,is_airport,is_charger,meta")
      .order("name");

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
