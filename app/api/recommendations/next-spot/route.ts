import { ok, bad } from "@/lib/api-respond";
import { computeNextZonesForDriver } from "@/lib/server/recommendation";
import {
  GeoJsonPoint,
  isValidLatitude,
  isValidLongitude,
  latLonFromPoint,
} from "@/lib/server/geo-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CACHE_TTL_MS = 60_000;

type DriverStateRow = {
  loc: GeoJsonPoint | null;
  speed_kmh: number | null;
  snapped_zone: number | null;
  recommendation: any;
  updated_at: string;
};

type LatestPingRow = {
  loc: GeoJsonPoint | null;
  speed_kmh: number | null;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { supabase, user } = await createServerSupabaseClient();
  if (!user) {
    return bad("Please sign in", null, 401, "UNAUTHENTICATED");
  }

  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");
  const kParam = url.searchParams.get("k");
  const hasExplicitCoords = latParam !== null && lonParam !== null;
  const k = Math.min(Math.max(parseInt(kParam ?? "3", 10) || 3, 1), 10);

  let currentLoc: { lat: number; lon: number } | null = null;
  let snappedZoneId: number | null = null;
  let speedKmh: number | null = null;
  let responseSource: "live" | "cached" | "fallback" = "live";

  let driverState: DriverStateRow | null = null;

  if (hasExplicitCoords) {
    const lat = Number(latParam);
    const lon = Number(lonParam);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return bad(
        "Invalid coordinates",
        { lat: latParam, lon: lonParam },
        400,
        "INVALID_INPUT"
      );
    }
    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return bad(
        "Coordinates out of range",
        { lat, lon },
        400,
        "INVALID_INPUT"
      );
    }
    currentLoc = { lat, lon };
  } else {
    const {
      data: stateRow,
      error: stateError,
      status: stateStatus,
    } = await supabase
      .from("driver_state")
      .select("loc,speed_kmh,snapped_zone,recommendation,updated_at")
      .eq("driver_id", user.id)
      .maybeSingle();

    if (stateError && stateStatus !== 406 && stateError.code !== "PGRST116") {
      if (stateStatus === 401) {
        return bad("Please sign in", null, 401, "UNAUTHENTICATED");
      }
      if (stateStatus === 403 || stateError.code === "42501") {
        return bad("Forbidden", null, 403, "FORBIDDEN");
      }
      console.error("[next-spot] driver_state fetch failed", {
        driverId: user.id,
        error: stateError,
      });
      return bad(
        "Database error while reading driver_state",
        stateError,
        500,
        "DB_ERROR"
      );
    }

    if (stateRow) {
      driverState = stateRow as DriverStateRow;
      const coords = latLonFromPoint(stateRow.loc);
      if (coords.lat !== null && coords.lon !== null) {
        currentLoc = { lat: coords.lat, lon: coords.lon };
      }
      speedKmh = stateRow.speed_kmh;
      snappedZoneId = stateRow.snapped_zone;
    }
  }

  if (!currentLoc) {
    const {
      data: latestPing,
      error: pingError,
    } = await supabase
      .from("pings")
      .select("loc,speed_kmh")
      .eq("driver_id", user.id)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pingError && pingError.code !== "PGRST116") {
      console.error("[next-spot] latest ping lookup failed", {
        driverId: user.id,
        error: pingError,
      });
    } else {
      const fallback = latestPing as LatestPingRow | null;
      if (fallback?.loc) {
        const coords = latLonFromPoint(fallback.loc);
        if (coords.lat !== null && coords.lon !== null) {
          currentLoc = { lat: coords.lat, lon: coords.lon };
          if (speedKmh === null && typeof fallback.speed_kmh === "number") {
            speedKmh = fallback.speed_kmh;
          }
        }
      }
    }
  }

  if (!currentLoc) {
    return ok({
      error: {
        code: "NO_STATE",
        message: "No recent location found. Enable live tracking or pass lat/lon.",
      },
    });
  }

  const { lat, lon } = currentLoc;

  if (!hasExplicitCoords && driverState?.recommendation) {
    const updatedAt = new Date(driverState.updated_at).getTime();
    if (Date.now() - updatedAt < CACHE_TTL_MS) {
      responseSource = "cached";
      return ok({
        computed_at:
          driverState.recommendation.computed_at ?? driverState.updated_at,
        source: responseSource,
        traffic_source: driverState.recommendation.traffic_source ?? null,
        context: driverState.recommendation.context ?? null,
        top: driverState.recommendation.top ?? [],
      });
    }
  }

  if (!snappedZoneId) {
    const { data: zoneData, error: zoneError } = await supabase.rpc(
      "nearest_zone",
      {
        p_lon: lon,
        p_lat: lat,
        p_max_m: 3000,
      }
    );

    if (zoneError) {
      console.error("[next-spot] nearest_zone failed", {
        driverId: user.id,
        error: zoneError,
      });
    } else if (typeof zoneData === "number") {
      snappedZoneId = zoneData;
    }
  }

  try {
    const recommendation = await computeNextZonesForDriver({
      supabase,
      driverId: user.id,
      currentLoc,
      snappedZoneId,
      now: new Date(),
      currentSpeedKmh: speedKmh ?? undefined,
      k,
    });

    if (recommendation.traffic_source === "fallback") {
      responseSource = "fallback";
    }

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
      currentLoc,
      error,
    });
    return bad("Failed to compute recommendations", null, 500, "DB_ERROR");
  }
}
