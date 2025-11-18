import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { CreateChargeReq } from "@/lib/zod-schemas";

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser(req);
    const json = await req.json();
    const body = CreateChargeReq.parse(json);

    const { data, error } = await supabase
      .from("charges")
      .insert({
        driver_id: user.id,
        station_zone: body.station_zone ?? null,
        start_at: body.start_at ?? new Date().toISOString(),
        end_at: body.end_at ?? null,
        kwh: body.kwh ?? null,
        cost_inr: body.cost_inr ?? null,
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
      .from("charges")
      .select("id,driver_id,station_zone,start_at,end_at,kwh,cost_inr,created_at")
      .order("start_at", { ascending: false })
      .limit(limit);

    if (error) return bad("DB error", error, 500);

    return ok(data);
  } catch (e: any) {
    if (e.message === "Unauthorized") return bad("Unauthorized", null, 401);
    return bad("Unexpected error", e?.message ?? e, 500);
  }
}
