import type { ZoneRow } from "@/hooks/useZones";

export type Coordinate = {
  lat: number;
  lon: number;
};

export type LocalZoneSuggestion = {
  zone_id: ZoneRow["id"];
  zone_name: string;
  lat: number;
  lon: number;
  distance_m: number;
  distance_km: number;
  eta_min: number;
  score: number;
  radius_km: number | null;
  weight_demand: number | null;
  inside_radius: boolean;
  reason: string;
};

export type ComputeNearestZonesOptions = {
  limit?: number;
  vehicleSpeedKmh?: number;
  origin?: string;
};

export type ComputeNearestZonesResult = {
  results: LocalZoneSuggestion[];
  best: LocalZoneSuggestion | null;
};

const EARTH_RADIUS_M = 6371e3;
const DEFAULT_SPEED_KMH = 20;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceMeters(a: Coordinate, b: Coordinate) {
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_M * c;
}

function resolveZoneCoordinate(zone: ZoneRow): Coordinate | null {
  const center = zone.center as { coordinates?: [number, number] } | null;
  if (center && Array.isArray(center.coordinates) && center.coordinates.length === 2) {
    const [lon, lat] = center.coordinates;
    if (typeof lat === "number" && typeof lon === "number") {
      return { lat, lon };
    }
  }

  if (typeof zone.lat === "number" && typeof zone.lon === "number") {
    return { lat: zone.lat, lon: zone.lon };
  }

  return null;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(1, Number(value.toFixed(4))));
}

function computeZoneScore(distanceKm: number, insideRadius: boolean, weight: number | null | undefined) {
  const distanceScore = Math.max(0, 1 - distanceKm / 4); // degrade after 4km
  const insideBoost = insideRadius ? 0.2 : 0;
  const normalizedWeight = typeof weight === "number" && Number.isFinite(weight) ? weight : 1;
  const demandBoost = Math.min(0.4, (normalizedWeight - 1) * 0.25);
  return clampScore(distanceScore + insideBoost + demandBoost);
}

function describeReason(distanceM: number, insideRadius: boolean, weight: number | null | undefined) {
  const parts: string[] = [];
  if (distanceM < 1000) {
    parts.push(`${Math.round(distanceM)}m away`);
  } else {
    parts.push(`${(distanceM / 1000).toFixed(1)} km away`);
  }
  if (insideRadius) {
    parts.push("inside zone radius");
  }
  if (typeof weight === "number" && weight > 1) {
    parts.push(`demand +${Math.round((weight - 1) * 100)}%`);
  }
  return `Local pick • ${parts.join(" · ")}`;
}

export function computeNearestZones(
  zones: ZoneRow[],
  location: Coordinate,
  opts?: ComputeNearestZonesOptions
): ComputeNearestZonesResult {
  if (!zones.length) {
    return { results: [], best: null };
  }
  const limit = opts?.limit ?? 3;
  const speed = opts?.vehicleSpeedKmh ?? DEFAULT_SPEED_KMH;

  const enriched = zones
    .map<LocalZoneSuggestion | null>((zone) => {
      const coord = resolveZoneCoordinate(zone);
      if (!coord) return null;

      const distance_m = distanceMeters(location, coord);
      const distance_km = distance_m / 1000;
      const radius_km =
        typeof zone.radius_km === "number" && Number.isFinite(zone.radius_km)
          ? zone.radius_km
          : null;
      const inside_radius = radius_km !== null ? distance_m <= radius_km * 1000 : distance_m <= 500;
      const eta_min = Math.max(1, Math.round((distance_km / speed) * 60));
      const score = computeZoneScore(distance_km, inside_radius, zone.weight_demand ?? null);

      return {
        zone_id: zone.id,
        zone_name: zone.name,
        lat: coord.lat,
        lon: coord.lon,
        distance_m,
        distance_km,
        eta_min,
        score,
        radius_km,
        weight_demand: zone.weight_demand ?? null,
        inside_radius,
        reason: describeReason(distance_m, inside_radius, zone.weight_demand ?? null),
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (a.score === b.score) {
        return a.distance_m - b.distance_m;
      }
      return b.score - a.score;
    })
    .slice(0, limit) as LocalZoneSuggestion[];

  if (enriched.length && typeof window !== "undefined") {
    console.log("[nearest-zones] computed", {
      origin: opts?.origin ?? "unknown",
      best_zone: enriched[0]?.zone_name,
      distance_m: Math.round(enriched[0]?.distance_m ?? 0),
      considered: zones.length,
    });
  }

  return { results: enriched, best: enriched[0] ?? null };
}
