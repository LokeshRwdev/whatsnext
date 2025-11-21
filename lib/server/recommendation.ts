import type { SupabaseClient } from "@supabase/supabase-js";
import { distanceKm, estimateETA } from "./geo-utils";
import {
  bucketLabel as bucketLabelForDate,
  isWithinSameBucket,
  truncateTo30MinBucket,
} from "./time-utils";
import { getTrafficMatrix, type TrafficMatrixEntry } from "./googleMaps";

const DEFAULT_MAX_DISTANCE_KM = 12;
const SUCCESS_LOOKBACK_DAYS = 14;
const DEFAULT_FARE_INR = 180;
const SCORE_WEIGHTS = {
  success: 0.4,
  fare: 0.3,
  eta: 0.2,
  traffic: 0.1,
} as const;
const TRAFFIC_REUSE_DISTANCE_METERS = 200;
const TRAFFIC_REUSE_INTERVAL_MS = 45_000;

export type RecommendationSignals = {
  traffic_speed_idx?: number | null;
  route_incident?: boolean | null;
  airport_wave?: number | null;
  weather_flag_rain?: boolean | null;
  event_flag?: boolean | null;
};

export type RecommendationContextSnapshot = RecommendationSignals & {
  driver_id: string;
  snapped_zone: number | null;
  bucket_start: string;
  bucket_label: string;
  traffic_source?: "google" | "cache" | "fallback";
  reason?: string;
};

export type ZoneRecommendation = {
  zone_id: number;
  zone_name: string;
  lat: number;
  lon: number;
  distance_km: number;
  eta_min: number;
  score: number;
  success_prob: number;
  expected_fare_inr: number;
  normalized_fare: number;
  traffic_penalty: number;
  traffic_speed_idx: number | null;
  reason: string;
};

export type RecommendationResult = {
  computed_at: string;
  context: RecommendationContextSnapshot;
  top: ZoneRecommendation[];
  traffic_source: "google" | "cache" | "fallback";
};

export interface ComputeNextZonesParams {
  supabase: SupabaseClient;
  driverId: string;
  currentLoc: { lat: number; lon: number };
  snappedZoneId?: number | null;
  context?: RecommendationSignals;
  now?: Date | string;
  currentSpeedKmh?: number | null;
  k?: number;
}

type GeoPoint = {
  type?: string;
  coordinates?: [number, number];
  crs?: { type: string; properties: Record<string, any> };
};

type ZoneRow = {
  id: number;
  slug?: string | null;
  name: string | null;
  lat?: number | null;
  lon?: number | null;
  center?: GeoPoint | string | null;
  geom?: GeoPoint | string | null;
  radius_km?: number | null;
  weight_demand?: number | null;
  weight_airport?: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
};

type CandidateZone = {
  zone: ZoneRow & { lat: number; lon: number; name: string };
  distanceKm: number;
};

type CandidateFetchResult = {
  candidates: CandidateZone[];
  totalZones: number;
  zonesWithCoordinates: number;
  reason?: "no_zones_in_db" | "no_zones_with_coords" | "zones_too_far" | "zone_query_failed";
};

type TrainingRow = {
  zone_id: number;
  bucket_30m?: string | null;
  label_ride_15m?: boolean | number | null;
  success_prob?: number | null;
  sample_size?: number | null;
  created_at?: string | null;
};

type TripRow = {
  pickup_zone: number | null;
  fare_inr: number | null;
  completed_at?: string | null;
};

type SuccessStats = Map<number, { prob: number; samples: number }>;
type FareStats = Map<number, { sum: number; count: number }>;

type TrafficSnapshotEntry = {
  zoneId: number;
  distanceMeters: number | null;
  durationSeconds: number | null;
  durationInTrafficSeconds: number | null;
  trafficSpeedIdx: number | null;
  status: string;
};

type TrafficSnapshot = {
  entries: Map<number, TrafficSnapshotEntry>;
  source: "google" | "cache" | "fallback";
  fetchedAt: number;
};

type DriverTrafficCacheEntry = {
  destKey: string;
  origin: { lat: number; lon: number };
  snapshot: TrafficSnapshot;
};

const driverTrafficCache = new Map<string, DriverTrafficCacheEntry>();

/**
 * Compute the top-k next zones for a driver by blending success probability,
 * fare expectations, travel time, and traffic signals.
 * This is the single entry point for recommendation logic so it can later
 * be swapped with a learning system / bandit without touching route handlers.
 */
export async function computeNextZonesForDriver(
  params: ComputeNextZonesParams
): Promise<RecommendationResult> {
  const {
    supabase,
    driverId,
    currentLoc,
    snappedZoneId = null,
    k = 3,
    context,
    now,
    currentSpeedKmh,
  } = params;

  const computedAt =
    typeof now === "string" ? new Date(now) : now ? now : new Date();

  const bucketStart = truncateTo30MinBucket(computedAt);
  const bucketIso = bucketStart.toISOString();
  const bucketLabel = bucketLabelForDate(bucketStart);

  const normalizedContext = normalizeContext(context);
  let contextReason: RecommendationContextSnapshot["reason"];

  const candidateFetch = await fetchCandidateZones(supabase, currentLoc);
  const candidates = candidateFetch.candidates;
  
  console.log("[recommendations] candidate fetch result", {
    driverId,
    currentLoc,
    totalZones: candidateFetch.totalZones,
    zonesWithCoordinates: candidateFetch.zonesWithCoordinates,
    candidateCount: candidates.length,
    reason: candidateFetch.reason ?? null,
  });

  if (candidates.length === 0) {
    const reason =
      candidateFetch.totalZones === 0
        ? "no_zones_in_db"
        : candidateFetch.zonesWithCoordinates === 0
        ? "no_zones_with_coords"
        : "zones_too_far";

    contextReason = candidateFetch.reason ?? reason;

    console.warn("[recommendations] No candidates available", {
      driverId,
      reason,
      totalZones: candidateFetch.totalZones,
      zonesWithCoordinates: candidateFetch.zonesWithCoordinates,
      currentLoc,
    });

    return {
      computed_at: computedAt.toISOString(),
      context: {
        ...normalizedContext,
        driver_id: driverId,
        snapped_zone: snappedZoneId,
        bucket_start: bucketIso,
        bucket_label: bucketLabel,
        traffic_source: "fallback",
        reason,
      },
      top: [],
      traffic_source: "fallback",
    };
  }

  const zoneIds = candidates.map((c) => c.zone.id);
  const [successStats, fareStats, trafficSnapshot] = await Promise.all([
    loadTrainingSuccess(supabase, zoneIds, bucketStart, driverId),
    loadExpectedFare(supabase, zoneIds, bucketStart, driverId),
    resolveTrafficSnapshot({
      driverId,
      origin: currentLoc,
      candidates,
      departure: computedAt,
      currentSpeedKmh: currentSpeedKmh ?? null,
    }),
  ]);

  const fallbackFare = resolveFallbackFare(fareStats);

  let trafficSpeedSum = 0;
  let trafficSpeedSamples = 0;

  const zoneWithStats = candidates.map((candidate) => {
    const zoneId = candidate.zone.id;
    const successEntry = successStats.get(zoneId);
    const successProb = successEntry ? successEntry.prob : 0.35;

    const fareEntry = fareStats.get(zoneId);
    const expectedFare =
      fareEntry && fareEntry.count > 0
        ? fareEntry.sum / fareEntry.count
        : fallbackFare;

    const trafficEntry = trafficSnapshot.entries.get(zoneId);
    const fallbackDistanceMeters = candidate.distanceKm * 1000;
    const distanceMeters =
      trafficEntry?.distanceMeters && trafficEntry.distanceMeters > 0
        ? trafficEntry.distanceMeters
        : fallbackDistanceMeters;
    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
    const etaSeconds =
      trafficEntry?.durationInTrafficSeconds && trafficEntry.durationInTrafficSeconds > 0
        ? trafficEntry.durationInTrafficSeconds
        : estimateETA(fallbackDistanceMeters, currentSpeedKmh) * 60;
    const etaMin = Number((etaSeconds / 60).toFixed(1));
    const trafficSpeedIdx =
      typeof trafficEntry?.trafficSpeedIdx === "number"
        ? trafficEntry.trafficSpeedIdx
        : null;

    if (typeof trafficSpeedIdx === "number") {
      trafficSpeedSum += trafficSpeedIdx;
      trafficSpeedSamples += 1;
    }

    return {
      zoneId,
      zoneName: candidate.zone.name,
      lat: candidate.zone.lat,
      lon: candidate.zone.lon,
      distanceKm,
      etaMin,
      successProb,
      expectedFare,
      trafficSpeedIdx,
    };
  });

  const maxFare = zoneWithStats.reduce(
    (max, zone) => Math.max(max, zone.expectedFare),
    fallbackFare
  );

  const scored = zoneWithStats.map((stat) => {
    const normalizedFare =
      maxFare > 0 ? Number((stat.expectedFare / maxFare).toFixed(3)) : 0;
    const etaPenalty = Math.min(stat.etaMin / 30, 1);
    const trafficPenalty = computeZoneTrafficPenalty(stat.trafficSpeedIdx, normalizedContext);
    const rawScore =
      SCORE_WEIGHTS.success * stat.successProb +
      SCORE_WEIGHTS.fare * normalizedFare -
      SCORE_WEIGHTS.eta * etaPenalty -
      SCORE_WEIGHTS.traffic * trafficPenalty;
    const score = clamp(rawScore, 0, 1);

    const reason = buildReason(
      stat,
      normalizedFare,
      stat.trafficSpeedIdx,
      normalizedContext
    );

    return {
      zone_id: stat.zoneId,
      zone_name: stat.zoneName,
      lat: stat.lat,
      lon: stat.lon,
      distance_km: stat.distanceKm,
      eta_min: stat.etaMin,
      score: Number(score.toFixed(3)),
      success_prob: Number(stat.successProb.toFixed(3)),
      expected_fare_inr: Math.round(stat.expectedFare),
      normalized_fare: normalizedFare,
      traffic_penalty: Number(trafficPenalty.toFixed(2)),
      traffic_speed_idx:
        typeof stat.trafficSpeedIdx === "number"
          ? Number(stat.trafficSpeedIdx.toFixed(2))
          : null,
      reason,
    } as ZoneRecommendation;
  });

  scored.sort((a, b) => b.score - a.score);

  const trafficSpeedIdx =
    trafficSpeedSamples > 0
      ? Number((trafficSpeedSum / trafficSpeedSamples).toFixed(2))
      : normalizedContext.traffic_speed_idx ?? null;

  let trafficSource: RecommendationResult["traffic_source"] = trafficSnapshot.source;
  let topRecommendations = scored.slice(0, Math.max(1, k));

  // CRITICAL: Always ensure we return nearest zones when candidates exist
  if (topRecommendations.length === 0 && candidates.length > 0) {
    const sample = candidates.slice(0, Math.min(3, candidates.length)).map((c) => ({
      id: c.zone.id,
      distanceKm: Number(c.distanceKm.toFixed(2)),
    }));
    console.warn("[recommendations] scored list empty, falling back to nearest zones", {
      driverId,
      candidateCount: candidates.length,
      currentLoc,
      sample,
    });
    topRecommendations = buildFallbackRecommendations(candidates, k, currentSpeedKmh ?? null);
    trafficSource = "fallback";
    contextReason = "nearest_distance_fallback";
  }

  // Additional safety: if topRecommendations is still empty but candidates exist, force nearest-by-distance
  if (topRecommendations.length === 0 && candidates.length > 0) {
    console.error("[recommendations] CRITICAL: topRecommendations empty despite candidates", {
      driverId,
      candidateCount: candidates.length,
      scoredCount: scored.length,
      currentLoc,
    });
    const emergency = [...candidates]
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, Math.max(1, k));
    topRecommendations = emergency.map((c) => ({
      zone_id: c.zone.id,
      zone_name: c.zone.name,
      lat: c.zone.lat,
      lon: c.zone.lon,
      distance_km: Number(c.distanceKm.toFixed(2)),
      eta_min: Number(estimateETA(c.distanceKm * 1000, currentSpeedKmh ?? undefined).toFixed(1)),
      score: 0.5,
      success_prob: 0.35,
      expected_fare_inr: DEFAULT_FARE_INR,
      normalized_fare: 0.5,
      traffic_penalty: 0,
      traffic_speed_idx: null,
      reason: "Emergency fallback: nearest by distance",
    }));
    trafficSource = "fallback";
    contextReason = "nearest_distance_fallback";
  }

  const contextSnapshot: RecommendationContextSnapshot = {
    ...normalizedContext,
    traffic_speed_idx: trafficSpeedIdx,
    driver_id: driverId,
    snapped_zone: snappedZoneId,
    bucket_start: bucketIso,
    bucket_label: bucketLabel,
    traffic_source: trafficSource,
    ...(contextReason ? { reason: contextReason } : {}),
  };

  return {
    computed_at: computedAt.toISOString(),
    context: contextSnapshot,
    top: topRecommendations,
    traffic_source: trafficSource,
  };
}

async function fetchCandidateZones(
  supabase: SupabaseClient,
  currentLoc: { lat: number; lon: number }
): Promise<CandidateFetchResult> {
  const { data, error } = await supabase
    .from("zones")
    .select("id,slug,name,lat,lon,center,geom,radius_km,weight_demand,weight_airport,is_active")
    .limit(200);

  if (error || !data) {
    console.error("[recommendations] zone fetch failed", {
      error,
    });
    return { candidates: [], totalZones: 0, zonesWithCoordinates: 0, reason: "zone_query_failed" };
  }

  const rows = data as ZoneRow[];
  const totalZones = rows.length;
  if (totalZones === 0) {
    console.warn("[recommendations] No zones found in DB when building candidates");
    return { candidates: [], totalZones: 0, zonesWithCoordinates: 0, reason: "no_zones_in_db" };
  }

  const activeRows = rows.filter((row) => row.is_active !== false);
  const prioritizedRows = activeRows.length > 0 ? activeRows : rows;
  const hardCap = 25;

  const defaultCollection = collectCandidateZones(
    prioritizedRows,
    currentLoc,
    DEFAULT_MAX_DISTANCE_KM * 1.5
  );

  let candidates = defaultCollection.candidates;
  let zonesWithCoordinates = defaultCollection.totalResolved;
  let reason: CandidateFetchResult["reason"];

  if (zonesWithCoordinates === 0) {
    reason = "no_zones_with_coords";
    console.warn("[recommendations] Zones exist but none contain usable coordinates", {
      totalZones,
    });
  }

  if (candidates.length === 0 && zonesWithCoordinates > 0) {
    reason = "zones_too_far";
    const relaxedRadius = DEFAULT_MAX_DISTANCE_KM * 3;
    const relaxed = collectCandidateZones(prioritizedRows, currentLoc, relaxedRadius);
    if (relaxed.candidates.length > 0) {
      console.warn("[recommendations] No zones within default radius, using relaxed fallback", {
        totalZones,
        relaxedRadiusKm: relaxedRadius,
      });
      candidates = relaxed.candidates;
      zonesWithCoordinates = relaxed.totalResolved;
    } else {
      console.warn(
        "[recommendations] No zones within relaxed radius, defaulting to all zones sorted by distance",
        { totalZones, resolvedZones: zonesWithCoordinates }
      );
      const allCandidates = collectCandidateZones(prioritizedRows, currentLoc);
      candidates = allCandidates.candidates;
      zonesWithCoordinates = allCandidates.totalResolved;
    }
  }

  const trimmed = candidates.slice(0, hardCap);
  return {
    candidates: trimmed,
    totalZones,
    zonesWithCoordinates,
    reason: trimmed.length === 0 ? reason ?? "zones_too_far" : undefined,
  };
}

function collectCandidateZones(
  rows: ZoneRow[],
  currentLoc: { lat: number; lon: number },
  maxDistanceKm?: number
): { candidates: CandidateZone[]; totalResolved: number } {
  const resolved: CandidateZone[] = [];
  for (const row of rows) {
    const coords = resolveZoneCoordinates(row);
    if (!coords) continue;
    const distance = distanceKm(currentLoc.lat, currentLoc.lon, coords.lat, coords.lon);
    resolved.push({
      zone: {
        ...row,
        name: normalizeZoneName(row),
        lat: coords.lat,
        lon: coords.lon,
      },
      distanceKm: distance,
    });
  }

  resolved.sort((a, b) => a.distanceKm - b.distanceKm);
  const filtered =
    typeof maxDistanceKm === "number"
      ? resolved.filter((candidate) => candidate.distanceKm <= maxDistanceKm)
      : resolved;

  return {
    candidates: filtered,
    totalResolved: resolved.length,
  };
}

function normalizeZoneName(row: ZoneRow): string {
  if (row.name && row.name.trim().length > 0) {
    return row.name.trim();
  }
  if (row.slug && row.slug.trim().length > 0) {
    return row.slug.replace(/_/g, " ").trim();
  }
  return `Zone ${row.id}`;
}

function resolveZoneCoordinates(row: ZoneRow): { lat: number; lon: number } | null {
  const lat = toFiniteNumber(row.lat);
  const lon = toFiniteNumber(row.lon);
  if (lat !== null && lon !== null) {
    return { lat, lon };
  }

  const fromCenter = parseGeometryValue(row.center);
  if (fromCenter) return fromCenter;

  const fromGeom = parseGeometryValue(row.geom);
  if (fromGeom) return fromGeom;

  return null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function parseGeometryValue(
  value: GeoPoint | string | null | undefined
): { lat: number; lon: number } | null {
  if (!value) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseGeometryValue(parsed as GeoPoint);
      } catch {
        // fall through to WKT parsing
      }
    }
    return parseWktPoint(trimmed);
  }

  const anyValue = value as Record<string, any>;
  if (Array.isArray(anyValue.coordinates) && anyValue.coordinates.length >= 2) {
    const [lon, lat] = anyValue.coordinates;
    const latNum = toFiniteNumber(lat);
    const lonNum = toFiniteNumber(lon);
    if (latNum !== null && lonNum !== null) {
      return { lat: latNum, lon: lonNum };
    }
  }

  const fallbackLat = toFiniteNumber(anyValue.lat ?? anyValue.latitude);
  const fallbackLon = toFiniteNumber(anyValue.lon ?? anyValue.lng ?? anyValue.longitude);
  if (fallbackLat !== null && fallbackLon !== null) {
    return { lat: fallbackLat, lon: fallbackLon };
  }

  return null;
}

function parseWktPoint(value: string): { lat: number; lon: number } | null {
  const normalized = value.includes(";") ? value.split(";").pop()!.trim() : value.trim();
  const match = normalized.match(/POINT\s*\(([^)]+)\)/i);
  if (!match) return null;
  const [maybeLon, maybeLat] = match[1].trim().split(/\s+/);
  const lon = Number(maybeLon);
  const lat = Number(maybeLat);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { lat, lon };
  }
  return null;
}

function buildFallbackRecommendations(
  candidates: CandidateZone[],
  k: number,
  currentSpeedKmh: number | null
): ZoneRecommendation[] {
  const limit = Math.max(1, k);
  const fallbackZones = [...candidates].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
  return fallbackZones.map((candidate) => {
    const distanceKm = Number(candidate.distanceKm.toFixed(2));
    const etaMinutes = estimateETA(candidate.distanceKm * 1000, currentSpeedKmh ?? undefined);
    const normalizedDistance = clamp(distanceKm / (DEFAULT_MAX_DISTANCE_KM * 2), 0, 1);
    const demandWeight =
      typeof candidate.zone.weight_demand === "number" && candidate.zone.weight_demand > 0
        ? clamp(candidate.zone.weight_demand, 0.5, 2)
        : 1;
    const airportWeight =
      typeof candidate.zone.weight_airport === "number"
        ? clamp(candidate.zone.weight_airport, 0, 2)
        : 0;
    const baseScore = 1 - normalizedDistance;
    const weightedScore = clamp(baseScore * demandWeight + airportWeight * 0.05, 0, 1);
    const successProb = clamp(0.35 * demandWeight, 0.2, 0.95);
    return {
      zone_id: candidate.zone.id,
      zone_name: candidate.zone.name,
      lat: candidate.zone.lat,
      lon: candidate.zone.lon,
      distance_km: distanceKm,
      eta_min: Number(etaMinutes.toFixed(1)),
      score: Number(weightedScore.toFixed(3)),
      success_prob: Number(successProb.toFixed(3)),
      expected_fare_inr: DEFAULT_FARE_INR,
      normalized_fare: clamp(0.5 * demandWeight, 0, 1),
      traffic_penalty: 0.2,
      traffic_speed_idx: null,
      reason: "Nearest zones by distance (fallback)",
    };
  });
}

async function loadTrainingSuccess(
  supabase: SupabaseClient,
  zoneIds: number[],
  bucketStart: Date,
  driverId: string
): Promise<SuccessStats> {
  const stats: SuccessStats = new Map();
  if (zoneIds.length === 0) return stats;

  const lookback = new Date(bucketStart);
  lookback.setDate(lookback.getDate() - SUCCESS_LOOKBACK_DAYS);

  const { data, error } = await supabase
    .from("training_examples")
    .select("zone_id,label_ride_15m,success_prob,sample_size,bucket_30m,created_at")
    .in("zone_id", zoneIds)
    .gte("created_at", lookback.toISOString());

  if (error || !data) {
    console.error("[recommendations] training fetch failed", {
      driverId,
      error,
    });
    return stats;
  }

  for (const row of data as TrainingRow[]) {
    const zoneId = row.zone_id;
    const rowBucket = row.bucket_30m ?? row.created_at ?? bucketStart.toISOString();
    if (!isWithinSameBucket(rowBucket, bucketStart)) continue;

    const entry = stats.get(zoneId) ?? { prob: 0, samples: 0 };
    const sampleSize =
      typeof row.sample_size === "number" && row.sample_size > 0 ? row.sample_size : 1;
    const labelValue =
      typeof row.success_prob === "number" && sampleSize > 1
        ? clamp(row.success_prob, 0, 1) * sampleSize
        : normalizeLabel(row);

    entry.prob += labelValue;
    entry.samples += sampleSize;
    stats.set(zoneId, entry);
  }

  for (const [zoneId, entry] of stats.entries()) {
    const smoothed = smoothProbability(entry.prob, entry.samples);
    stats.set(zoneId, { prob: smoothed, samples: entry.samples });
  }

  return stats;
}

async function loadExpectedFare(
  supabase: SupabaseClient,
  zoneIds: number[],
  bucketStart: Date,
  driverId: string
): Promise<FareStats> {
  const stats: FareStats = new Map();
  if (zoneIds.length === 0) return stats;

  const lookback = new Date(bucketStart);
  lookback.setDate(lookback.getDate() - SUCCESS_LOOKBACK_DAYS);

  const { data, error } = await supabase
    .from("trips")
    .select("pickup_zone,fare_inr,completed_at")
    .in("pickup_zone", zoneIds)
    .gte("completed_at", lookback.toISOString());

  if (error || !data) {
    console.error("[recommendations] trip fare fetch failed", {
      driverId,
      error,
    });
    return stats;
  }

  for (const row of data as TripRow[]) {
    if (!row.pickup_zone) continue;
    const completedAt = row.completed_at;
    if (!completedAt || !isWithinSameBucket(completedAt, bucketStart)) continue;
    if (typeof row.fare_inr !== "number" || row.fare_inr <= 0) continue;

    const entry = stats.get(row.pickup_zone) ?? { sum: 0, count: 0 };
    entry.sum += row.fare_inr;
    entry.count += 1;
    stats.set(row.pickup_zone, entry);
  }

  return stats;
}

function normalizeContext(
  context?: RecommendationSignals
): RecommendationSignals {
  return {
    traffic_speed_idx:
      typeof context?.traffic_speed_idx === "number"
        ? clamp(context.traffic_speed_idx, 0, 1)
        : null,
    route_incident: Boolean(context?.route_incident),
    airport_wave:
      typeof context?.airport_wave === "number"
        ? clamp(context.airport_wave, 0, 1)
        : null,
    weather_flag_rain: Boolean(context?.weather_flag_rain),
    event_flag: Boolean(context?.event_flag),
  };
}

function computeZoneTrafficPenalty(
  trafficSpeedIdx: number | null,
  context: RecommendationSignals
): number {
  const effectiveIdx =
    typeof trafficSpeedIdx === "number"
      ? clamp(trafficSpeedIdx, 0, 1)
      : typeof context.traffic_speed_idx === "number"
        ? clamp(context.traffic_speed_idx, 0, 1)
        : null;
  const speedPenalty = effectiveIdx !== null ? 1 - effectiveIdx : 0.2;
  const incidentPenalty = context.route_incident ? 0.5 : 0;
  const weatherPenalty = context.weather_flag_rain ? 0.3 : 0;

  return clamp(speedPenalty + incidentPenalty + weatherPenalty, 0, 1);
}

function buildReason(
  stat: {
    zoneId: number;
    zoneName: string;
    distanceKm: number;
    etaMin: number;
    successProb: number;
    expectedFare: number;
  },
  normalizedFare: number,
  trafficSpeedIdx: number | null,
  context: RecommendationSignals
): string {
  const reasons: string[] = [];

  if (stat.successProb >= 0.65) {
    reasons.push("High hit rate");
  } else if (stat.successProb >= 0.5) {
    reasons.push("Steady bookings");
  }

  if (normalizedFare >= 0.7) {
    reasons.push("Premium fares");
  } else if (stat.expectedFare >= DEFAULT_FARE_INR + 40) {
    reasons.push("Above avg fare");
  }

  if (stat.distanceKm <= 2) {
    reasons.push("Very close");
  } else if (stat.distanceKm <= 5) {
    reasons.push("Nearby");
  }

  if (typeof trafficSpeedIdx === "number") {
    if (trafficSpeedIdx >= 0.8) {
      reasons.push("Traffic flowing");
    } else if (trafficSpeedIdx < 0.5) {
      reasons.push("Heavy traffic");
    }
  }

  if (context.airport_wave && /airport/i.test(stat.zoneName)) {
    reasons.push("Airport arrivals");
  }
  if (context.event_flag) {
    reasons.push("Event demand");
  }

  if (reasons.length === 0) {
    reasons.push("Balanced demand vs travel time");
  }

  return reasons.slice(0, 3).join("; ");
}

async function resolveTrafficSnapshot(opts: {
  driverId: string;
  origin: { lat: number; lon: number };
  candidates: CandidateZone[];
  departure: Date;
  currentSpeedKmh: number | null;
}): Promise<TrafficSnapshot> {
  const destKey = opts.candidates.map((c) => c.zone.id).sort((a, b) => a - b).join(",");
  const cached = driverTrafficCache.get(opts.driverId);
  if (cached && cached.destKey === destKey) {
    const movedMeters =
      distanceKm(
        opts.origin.lat,
        opts.origin.lon,
        cached.origin.lat,
        cached.origin.lon
      ) * 1000;
    const ageMs = Date.now() - cached.snapshot.fetchedAt;
    if (movedMeters < TRAFFIC_REUSE_DISTANCE_METERS && ageMs < TRAFFIC_REUSE_INTERVAL_MS) {
      return {
        entries: new Map(cached.snapshot.entries),
        source: cached.snapshot.source === "google" ? "cache" : cached.snapshot.source,
        fetchedAt: cached.snapshot.fetchedAt,
      };
    }
  }

  const destinations = opts.candidates.map((candidate) => ({
    zoneId: candidate.zone.id,
    lat: candidate.zone.lat,
    lon: candidate.zone.lon,
  }));

  try {
    const matrix = await getTrafficMatrix({
      origin: opts.origin,
      destinations,
      departureTime: opts.departure,
    });
    const snapshot = buildTrafficSnapshotFromMatrix(matrix);
    driverTrafficCache.set(opts.driverId, {
      destKey,
      origin: opts.origin,
      snapshot,
    });
    return snapshot;
  } catch (error) {
    console.warn("[recommendations] traffic matrix failed, using fallback", {
      driverId: opts.driverId,
      error,
    });
    const fallback = buildFallbackTrafficSnapshot(opts.candidates, opts.currentSpeedKmh);
    driverTrafficCache.set(opts.driverId, {
      destKey,
      origin: opts.origin,
      snapshot: fallback,
    });
    return fallback;
  }
}

function buildTrafficSnapshotFromMatrix(entries: TrafficMatrixEntry[]): TrafficSnapshot {
  const map = new Map<number, TrafficSnapshotEntry>();
  for (const entry of entries) {
    map.set(entry.zoneId, {
      zoneId: entry.zoneId,
      distanceMeters: entry.distanceMeters,
      durationSeconds: entry.durationSeconds,
      durationInTrafficSeconds: entry.durationInTrafficSeconds,
      trafficSpeedIdx: computeSpeedIndex(entry),
      status: entry.status,
    });
  }

  return {
    entries: map,
    source: "google",
    fetchedAt: Date.now(),
  };
}

function buildFallbackTrafficSnapshot(
  candidates: CandidateZone[],
  currentSpeedKmh: number | null
): TrafficSnapshot {
  const map = new Map<number, TrafficSnapshotEntry>();
  for (const candidate of candidates) {
    const distanceMeters = candidate.distanceKm * 1000;
    const etaSeconds = estimateETA(distanceMeters, currentSpeedKmh) * 60;
    map.set(candidate.zone.id, {
      zoneId: candidate.zone.id,
      distanceMeters,
      durationSeconds: etaSeconds,
      durationInTrafficSeconds: etaSeconds,
      trafficSpeedIdx: null,
      status: "FALLBACK",
    });
  }

  return {
    entries: map,
    source: "fallback",
    fetchedAt: Date.now(),
  };
}

function computeSpeedIndex(entry: TrafficMatrixEntry): number | null {
  if (
    !entry.durationSeconds ||
    !entry.durationInTrafficSeconds ||
    entry.durationSeconds <= 0 ||
    entry.durationInTrafficSeconds <= 0
  ) {
    return null;
  }
  const ratio = entry.durationSeconds / entry.durationInTrafficSeconds;
  return clamp(ratio, 0, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeLabel(row: TrainingRow): number {
  if (typeof row.success_prob === "number") {
    return row.success_prob;
  }
  if (typeof row.label_ride_15m === "number") {
    return clamp(row.label_ride_15m, 0, 1);
  }
  if (typeof row.label_ride_15m === "boolean") {
    return row.label_ride_15m ? 1 : 0;
  }
  return 0;
}

function smoothProbability(successSum: number, samples: number): number {
  return (successSum + 1) / (samples + 2);
}

function resolveFallbackFare(stats: FareStats): number {
  if (stats.size === 0) return DEFAULT_FARE_INR;
  let sum = 0;
  let count = 0;
  for (const entry of stats.values()) {
    sum += entry.sum;
    count += entry.count;
  }
  if (count === 0) return DEFAULT_FARE_INR;
  return sum / count;
}
