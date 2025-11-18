import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { OpsDailyUpsertReq } from "@/lib/zod-schemas";
import { z } from "zod";

function todayInIST() {
  const now = new Date();
  const offsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + offsetMs);
  return ist.toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser(req);
    const payload = OpsDailyUpsertReq.parse(await req.json());
    const day = payload.day ?? todayInIST();

    const { data: existing } = await supabase
      .from("ops_daily")
      .select(
        "platforms,idle_minutes,fuel_litres,fuel_cost_inr,energy_kwh,energy_cost_inr,tolls_parking_inr,notes"
      )
      .eq("driver_id", user.id)
      .eq("day", day)
      .maybeSingle();

    const record = {
      driver_id: user.id,
      day,
      platforms: payload.platforms ?? existing?.platforms ?? [],
      idle_minutes: payload.idle_minutes ?? existing?.idle_minutes ?? null,
      fuel_litres: payload.fuel_litres ?? existing?.fuel_litres ?? null,
      fuel_cost_inr: payload.fuel_cost_inr ?? existing?.fuel_cost_inr ?? null,
      energy_kwh: payload.energy_kwh ?? existing?.energy_kwh ?? null,
      energy_cost_inr:
        payload.energy_cost_inr ?? existing?.energy_cost_inr ?? null,
      tolls_parking_inr:
        payload.tolls_parking_inr ?? existing?.tolls_parking_inr ?? null,
      notes: payload.notes ?? existing?.notes ?? null,
    };

    const { data, error } = await supabase
      .from("ops_daily")
      .upsert(record, { onConflict: "driver_id,day" })
      .select(
        "driver_id,day,platforms,idle_minutes,fuel_litres,fuel_cost_inr,energy_kwh,energy_cost_inr,tolls_parking_inr,notes,updated_at"
      )
      .single();

    if (error) {
      console.error("[ops-daily/upsert] upsert failed", {
        driverId: user.id,
        error,
      });
      return bad("Failed to update ops daily", null, 500, "DB_ERROR");
    }

    return ok(data);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return bad("Unauthorized", null, 401, "UNAUTHORIZED");
    }
    if (error instanceof z.ZodError) {
      return bad("Invalid input", error.flatten(), 400, "INVALID_INPUT");
    }
    console.error("[ops-daily/upsert] unexpected error", error);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}
