import { ok, bad } from "@/lib/api-respond";
import { computeNextZonesForDriver } from "@/lib/server/recommendation";
import { isValidLatitude, isValidLongitude } from "@/lib/server/geo-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { supabase, user } = await createServerSupabaseClient();
  if (!user) {
    return bad("Please sign in", null, 401, "UNAUTHENTICATED");
  }

  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const kParam = url.searchParams.get("k");

  if (latParam === null || lonParam === null) {
    return bad(
      "lat & lon required and must be numbers",
      { lat: latParam, lon: lonParam },
      400,
      "INVALID_INPUT"
    );
  }

  const lat = Number(latParam);
  const lon = Number(lonParam);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    !isValidLatitude(lat) ||
    !isValidLongitude(lon)
  ) {
    return bad(
      "lat & lon required and must be numbers",
      { lat: latParam, lon: lonParam },
      400,
      "INVALID_INPUT"
    );
  }

  const k = clamp(parseInt(kParam ?? "3", 10) || 3, 1, 10);

  console.log("[next-spot] incoming request", {
    driverId: user.id,
    lat,
    lon,
    k,
  });

  let snappedZoneId: number | null = null;
  const { data: zoneData, error: zoneError } = await supabase.rpc("nearest_zone", {
    p_lon: lon,
    p_lat: lat,
    p_max_m: 3000,
  });

  if (zoneError) {
    console.warn("[next-spot] nearest_zone failed", {
      driverId: user.id,
      error: zoneError,
    });
  } else if (typeof zoneData === "number") {
    snappedZoneId = zoneData;
  }

  try {
    const recommendation = await computeNextZonesForDriver({
      supabase,
      driverId: user.id,
      currentLoc: { lat, lon },
      snappedZoneId,
      now: new Date(),
      k,
    });

    const responseSource: "live" | "fallback" =
      recommendation.traffic_source === "fallback" ||
      recommendation.context.reason === "nearest_distance_fallback"
        ? "fallback"
        : "live";

    return ok({
      computed_at: recommendation.computed_at,
      source: responseSource,
      traffic_source: recommendation.traffic_source,
      context: recommendation.context,
      top: recommendation.top,
    });
  } catch (error) {
    console.error("[next-spot] computeNextZonesForDriver failed", {
      userId: user.id,
      currentLoc: { lat, lon },
      error,
    });
    return bad("Failed to compute recommendations", null, 500, "DB_ERROR");
  }
}
