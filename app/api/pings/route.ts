import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { ok, bad } from "@/lib/api-respond";
import { z } from "zod";
import { CreatePingReq } from "@/lib/zod-schemas";
import { rateLimit } from "@/lib/ratelimit";
import { isValidLatitude, isValidLongitude, pointFromLatLon } from "@/lib/server/geo-utils";
import {
  computeNextZonesForDriver,
  type RecommendationContextSnapshot,
  type ZoneRecommendation,
} from "@/lib/server/recommendation";
import {
  bucketLabel,
  truncateTo30MinBucket,
} from "@/lib/server/time-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MIN_PING_INTERVAL_MS = 3000;
const driverPingWindows = new Map<string, number>();

function allowDriverPing(driverId: string) {
  const now = Date.now();
  const last = driverPingWindows.get(driverId) ?? 0;
  if (now - last < MIN_PING_INTERVAL_MS) {
    return false;
  }
  driverPingWindows.set(driverId, now);
  return true;
}

function normalizeTrafficContext(
  ctx: z.infer<typeof CreatePingReq>["traffic_context"]
) {
  if (!ctx) return {};
  const normalized: Record<string, unknown> = {};
  if (typeof ctx.traffic_speed_idx === "number") {
    normalized.traffic_speed_idx = ctx.traffic_speed_idx;
  }
  if (typeof ctx.route_incident === "boolean") {
    normalized.route_incident = ctx.route_incident;
  }
  if (typeof ctx.airport_wave === "number") {
    normalized.airport_wave = ctx.airport_wave;
  }
  if (typeof ctx.weather_flag_rain === "boolean") {
    normalized.weather_flag_rain = ctx.weather_flag_rain;
  }
  if (typeof ctx.event_flag === "boolean") {
    normalized.event_flag = ctx.event_flag;
  }
  return normalized;
}

async function recordTrainingExample(opts: {
  supabase: SupabaseClient;
  driverId: string;
  snappedZoneId: number;
  bucketIso: string;
  tsIso: string;
  trafficContext: Record<string, unknown>;
  recommendationTop: ZoneRecommendation[];
  recommendationContext: RecommendationContextSnapshot;
}) {
  const { supabase, driverId, snappedZoneId, bucketIso, tsIso } = opts;
  try {
    await supabase.from("training_examples").insert({
      driver_id: driverId,
      zone_id: snappedZoneId,
      arrived_at: tsIso,
      bucket_30m: bucketIso,
      context: {
        traffic: opts.trafficContext,
        computed: {
          traffic_speed_idx: opts.recommendationContext.traffic_speed_idx ?? null,
          traffic_source: opts.recommendationContext.traffic_source ?? null,
          airport_wave: opts.recommendationContext.airport_wave ?? null,
        },
        top: opts.recommendationTop,
      },
      label_ride_15m: null,
    });
  } catch (error) {
    console.error("[pings] training example insert failed", {
      driverId,
      error,
    });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return bad(
        "Content-Type must be application/json",
        null,
        415,
        "UNSUPPORTED_MEDIA_TYPE"
      );
    }

    const { supabase, user } = await createServerSupabaseClient();
    if (!user) {
      return Response.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Please sign in",
          },
        },
        { status: 401 }
      );
    }

    if (!allowDriverPing(user.id)) {
      return bad(
        "Rate limit exceeded",
        { limit: "1 ping/3s" },
        429,
        "RATE_LIMITED"
      );
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const ipLimit = rateLimit(`pings:${ip}`, 60, 60_000);
    if (!ipLimit.allowed) {
      return bad(
        "Rate limit exceeded",
        { limit: "60 req/min" },
        429,
        "RATE_LIMITED"
      );
    }

    const rawBody = await req.json();
    const payload = CreatePingReq.parse(rawBody);

    if (!isValidLatitude(payload.lat) || !isValidLongitude(payload.lon)) {
      return bad(
        "Invalid coordinates",
        { lat: payload.lat, lon: payload.lon },
        400,
        "INVALID_INPUT"
      );
    }

    const tsDate = payload.ts ? new Date(payload.ts) : new Date();
    if (Number.isNaN(tsDate.getTime())) {
      return bad("Invalid timestamp", null, 400, "INVALID_INPUT");
    }
    const tsIso = tsDate.toISOString();
    const bucketStart = truncateTo30MinBucket(tsDate);
    const bucketIso = bucketStart.toISOString();

    const trafficContext = normalizeTrafficContext(payload.traffic_context);

    const { data: previousState } = await supabase
      .from("driver_state")
      .select("snapped_zone")
      .eq("driver_id", user.id)
      .maybeSingle();

    const locPoint = pointFromLatLon(payload.lat, payload.lon);
    const insertPayload: Record<string, unknown> = {
      driver_id: user.id,
      ts: tsIso,
      loc: locPoint,
    };

    if (typeof payload.accuracy_m === "number") {
      insertPayload.accuracy_m = payload.accuracy_m;
    }
    if (typeof payload.battery_pct === "number") {
      insertPayload.battery_pct = payload.battery_pct;
    }
    if (typeof payload.speed_kmh === "number") {
      insertPayload.speed_kmh = payload.speed_kmh;
    }

    const {
      data: pingRow,
      error: pingError,
    } = await supabase
      .from("pings")
      .insert(insertPayload)
      .select("id,driver_id,ts,loc,speed_kmh,battery_pct")
      .maybeSingle();

    if (pingError) {
      return respondWithDbError(
        "Failed to save ping",
        pingError,
        user.id,
        payload
      );
    }

    const { data: snappedZoneData, error: snappedZoneError } =
      await supabase.rpc("nearest_zone", {
        p_lon: payload.lon,
        p_lat: payload.lat,
        p_max_m: 3000,
      });

    if (snappedZoneError) {
      console.error("[pings] nearest_zone failed", {
        driverId: user.id,
        error: snappedZoneError,
      });
    }

    const snappedZoneId =
      typeof snappedZoneData === "number" ? snappedZoneData : null;

    const recommendation = await computeNextZonesForDriver({
      supabase,
      driverId: user.id,
      currentLoc: { lat: payload.lat, lon: payload.lon },
      snappedZoneId,
      context: trafficContext,
      now: tsDate,
      currentSpeedKmh: payload.speed_kmh ?? null,
      k: 3,
    });

    const driverStatePayload = {
      driver_id: user.id,
      last_ping_at: tsIso,
      loc: locPoint,
      snapped_zone: snappedZoneId,
      accuracy_m: payload.accuracy_m ?? null,
      speed_kmh: payload.speed_kmh ?? null,
      battery_pct: payload.battery_pct ?? null,
      recommendation,
      updated_at: new Date().toISOString(),
    };

    const { error: stateError } = await supabase
      .from("driver_state")
      .upsert(driverStatePayload, { onConflict: "driver_id" });

    if (stateError) {
      return respondWithDbError(
        "Failed to update driver state",
        stateError,
        user.id,
        payload
      );
    }

    try {
      await supabase.from("decision_snapshots").insert({
        driver_id: user.id,
        decided_at: tsIso,
        lat: payload.lat,
        lon: payload.lon,
        snapped_zone: snappedZoneId,
        bucket_30m: bucketIso,
        context: {
          ...trafficContext,
          bucket_label: bucketLabel(bucketStart),
          traffic_speed_idx_computed: recommendation.context.traffic_speed_idx ?? null,
          airport_wave: recommendation.context.airport_wave ?? null,
          traffic_source: recommendation.traffic_source,
        },
        topk: recommendation.top,
        recommendation,
      });
    } catch (error) {
      console.error("[pings] decision snapshot insert failed", {
        driverId: user.id,
        error,
      });
    }

    if (
      snappedZoneId &&
      previousState?.snapped_zone &&
      previousState.snapped_zone !== snappedZoneId
    ) {
      await recordTrainingExample({
        supabase,
        driverId: user.id,
        snappedZoneId,
        bucketIso,
        tsIso,
        trafficContext,
        recommendationTop: recommendation.top ?? [],
        recommendationContext: recommendation.context,
      });
    }

    return ok({
      ping: pingRow,
      zone_id: snappedZoneId,
      snapped_zone: snappedZoneId,
      recommendation,
    });
  } catch (e: any) {
    if (e instanceof z.ZodError) {
      return bad("Validation failed", e.flatten(), 400, "INVALID_INPUT");
    }
    console.error("[pings] unexpected error", e);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}

function respondWithDbError(
  message: string,
  error: PostgrestError,
  userId: string,
  payload: unknown
) {
  console.error("[pings] DB error", {
    userId,
    payload,
    error,
  });

  return Response.json(
    {
      error: {
        code: "DB_ERROR",
        message,
        details: formatPostgrestError(error),
      },
    },
    { status: 500 }
  );
}

function formatPostgrestError(error: PostgrestError) {
  return {
    code: error.code,
    message: error.message,
    details: error.details ?? null,
    hint: error.hint ?? null,
  };
}

export async function GET(req: Request) {
  try {
    const { supabase, user } = await createServerSupabaseClient();
    if (!user) {
      return Response.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Please sign in",
          },
        },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "50", 10),
      200
    );

    const { data, error } = await supabase
      .from("pings")
      .select("id,ts,loc,battery_pct,speed_kmh")
      .order("ts", { ascending: false })
      .limit(limit);

    if (error) return bad("DB error", error, 500, "DB_ERROR");

    return ok(data);
  } catch (e: any) {
    console.error("[pings] GET failed", e);
    return bad("Unexpected error", null, 500, "INTERNAL_ERROR");
  }
}
