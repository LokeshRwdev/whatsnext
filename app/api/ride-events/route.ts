import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { RideEventIngestSchema } from "@/lib/zod-schemas";
import { ingestRideEvent } from "@/lib/server/ride-event-ingest";

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser(req);
    const payload = RideEventIngestSchema.parse(await req.json());

    const result = await ingestRideEvent({
      supabase,
      driverId: user.id,
      payload,
    });

    return ok(
      {
        event_id: result.eventId,
        pickup_zone: result.pickupZoneId,
        drop_zone: result.dropZoneId,
        occurred_at: result.occurredAt,
      },
      201
    );
  } catch (error: any) {
    if (error.message === "Unauthorized")
      return bad("Unauthorized", null, 401, "UNAUTHORIZED");
    if (error instanceof z.ZodError)
      return bad("Validation failed", error.flatten(), 400, "INVALID_INPUT");
    console.error("[ride-events] POST error", error);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}

export async function GET(req: Request) {
  try {
    const { supabase } = await requireUser(req);
    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      200
    );

    const { data, error } = await supabase
      .from("ride_events")
      .select("id,event_type,occurred_at,platform,pickup_zone,drop_zone")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) return bad("DB error", error, 500, "DB_ERROR");

    return ok(data);
  } catch (error: any) {
    if (error.message === "Unauthorized")
      return bad("Unauthorized", null, 401, "UNAUTHORIZED");
    console.error("[ride-events] GET error", error);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}
