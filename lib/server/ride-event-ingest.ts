import type { SupabaseClient } from "@supabase/supabase-js";
import type { RideEventIngestInput } from "@/lib/zod-schemas";
import {
  isValidLatitude,
  isValidLongitude,
  pointFromLatLon,
} from "./geo-utils";

const ZONE_SNAP_RADIUS_M = 3000;

interface IngestResult {
  eventId: number;
  pickupZoneId: number | null;
  dropZoneId: number | null;
  occurredAt: string;
}

export async function ingestRideEvent({
  supabase,
  driverId,
  payload,
}: {
  supabase: SupabaseClient;
  driverId: string;
  payload: RideEventIngestInput;
}): Promise<IngestResult> {
  const occurredAt = payload.occurred_at
    ? new Date(payload.occurred_at).toISOString()
    : new Date().toISOString();

  const hasPickup =
    typeof payload.pickup_lat === "number" &&
    typeof payload.pickup_lon === "number" &&
    isValidLatitude(payload.pickup_lat) &&
    isValidLongitude(payload.pickup_lon);

  const hasDrop =
    typeof payload.drop_lat === "number" &&
    typeof payload.drop_lon === "number" &&
    isValidLatitude(payload.drop_lat) &&
    isValidLongitude(payload.drop_lon);

  const [pickupZoneId, dropZoneId] = await Promise.all([
    hasPickup
      ? snapZoneId(supabase, payload.pickup_lat!, payload.pickup_lon!)
      : Promise.resolve(null),
    hasDrop
      ? snapZoneId(supabase, payload.drop_lat!, payload.drop_lon!)
      : Promise.resolve(null),
  ]);

  const insertPayload: Record<string, any> = {
    driver_id: driverId,
    event_type: payload.event_type,
    occurred_at: occurredAt,
    platform: payload.platform ?? null,
    surge_multiplier: payload.surge_multiplier ?? null,
    promo_code: payload.promo_code ?? null,
    cancel_reason:
      payload.event_type === "booking_cancelled"
        ? payload.cancel_reason ?? null
        : null,
    deadhead_distance_km: payload.deadhead_distance_km ?? null,
    deadhead_time_min: payload.deadhead_time_min ?? null,
    pickup_zone: pickupZoneId,
    drop_zone: dropZoneId,
    pickup_loc: hasPickup
      ? pointFromLatLon(payload.pickup_lat!, payload.pickup_lon!)
      : null,
    drop_loc: hasDrop
      ? pointFromLatLon(payload.drop_lat!, payload.drop_lon!)
      : null,
  };

  const { data, error } = await supabase
    .from("ride_events")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  if (payload.event_type === "ride_completed") {
    try {
      await supabase.rpc("upsert_trip_from_events", {
        p_driver_id: driverId,
        p_platform: payload.platform ?? null,
        p_fare_inr: payload.fare_inr ?? null,
        p_distance_km: payload.distance_km ?? null,
        p_pickup_zone: pickupZoneId,
        p_drop_zone: dropZoneId,
        p_completed_at: occurredAt,
        p_event_id: data?.id ?? null,
        p_deadhead_distance_km: payload.deadhead_distance_km ?? null,
        p_deadhead_time_min: payload.deadhead_time_min ?? null,
      });
    } catch (rpcError) {
      console.error("[ride-events] upsert_trip_from_events failed", {
        driverId,
        rpcError,
      });
    }
  }

  return {
    eventId: data!.id,
    pickupZoneId,
    dropZoneId,
    occurredAt,
  };
}

async function snapZoneId(
  supabase: SupabaseClient,
  lat: number,
  lon: number
): Promise<number | null> {
  const { data, error } = await supabase.rpc("nearest_zone", {
    p_lat: lat,
    p_lon: lon,
    p_max_m: ZONE_SNAP_RADIUS_M,
  });

  if (error) {
    console.error("[ride-events] nearest_zone failed", { error });
    return null;
  }

  return typeof data === "number" ? data : null;
}
