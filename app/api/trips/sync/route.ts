import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth-guard";
import { ok, bad } from "@/lib/api-respond";
import { TripSyncReq } from "@/lib/zod-schemas";
import { isValidLatitude, isValidLongitude } from "@/lib/server/geo-utils";
import { z } from "zod";

const SNAP_RADIUS_M = 3000;

export async function POST(req: Request) {
  try {
    const { supabase, user } = await requireUser(req);
    const payload = TripSyncReq.parse(await req.json());

    if (
      !isValidLatitude(payload.pickup_lat) ||
      !isValidLongitude(payload.pickup_lon) ||
      !isValidLatitude(payload.drop_lat) ||
      !isValidLongitude(payload.drop_lon)
    ) {
      return bad("Invalid coordinates", null, 400, "INVALID_INPUT");
    }

    const [pickupZone, dropZone] = await Promise.all([
      snapZoneId(supabase, payload.pickup_lat, payload.pickup_lon),
      snapZoneId(supabase, payload.drop_lat, payload.drop_lon),
    ]);

    const rpcPayload = {
      p_driver_id: user.id,
      p_platform: payload.platform,
      p_booking_at: payload.booking_at ?? payload.pickup_at,
      p_pickup_at: payload.pickup_at,
      p_drop_at: payload.drop_at,
      p_pickup_loc: toPoint(payload.pickup_lon, payload.pickup_lat),
      p_drop_loc: toPoint(payload.drop_lon, payload.drop_lat),
      p_pickup_zone: pickupZone,
      p_drop_zone: dropZone,
      p_distance_km: payload.distance_km,
      p_fare_inr: payload.fare_inr,
      p_surge_multiplier: payload.surge_multiplier ?? null,
      p_promo_code: payload.promo_code ?? null,
      p_deadhead_km: payload.deadhead_km ?? null,
      p_deadhead_min: payload.deadhead_min ?? null,
      p_tip_inr: payload.tip_inr ?? null,
    };

    const { data, error } = await supabase.rpc(
      "upsert_trip_from_events",
      rpcPayload
    );

    if (error) {
      console.error("[trips/sync] rpc failed", { driverId: user.id, error });
      return bad("Failed to upsert trip", null, 500, "DB_ERROR");
    }

    return ok(
      {
        trip_id: data?.trip_id ?? null,
        result: data,
      },
      201
    );
  } catch (error: any) {
    if (error.message === "Unauthorized")
      return bad("Unauthorized", null, 401, "UNAUTHORIZED");
    if (error instanceof z.ZodError)
      return bad("Invalid input", error.flatten(), 400, "INVALID_INPUT");
    console.error("[trips/sync] unexpected error", error);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}

async function snapZoneId(
  supabase: SupabaseClient,
  lat: number,
  lon: number
): Promise<number | null> {
  const { data, error } = await supabase.rpc("nearest_zone", {
    p_lat: lat,
    p_lon: lon,
    p_max_m: SNAP_RADIUS_M,
  });

  if (error) {
    console.error("[trips/sync] nearest_zone failed", { error });
    return null;
  }

  return typeof data === "number" ? data : null;
}

function toPoint(lon: number, lat: number) {
  return `SRID=4326;POINT(${lon} ${lat})`;
}
