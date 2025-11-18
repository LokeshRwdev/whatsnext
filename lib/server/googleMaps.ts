const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const MAX_DESTINATIONS_PER_REQUEST = 25;
const CACHE_COORD_PRECISION = 3; // ~100m grid
const CACHE_TTL_MS = 60_000;

export type TrafficMatrixDestination = {
  zoneId: number;
  lat: number;
  lon: number;
};

export type TrafficMatrixEntry = {
  zoneId: number;
  distanceMeters: number | null;
  durationSeconds: number | null;
  durationInTrafficSeconds: number | null;
  status: string;
};

type CacheEntry = {
  expiresAt: number;
  data: TrafficMatrixEntry[];
};

const responseCache = new Map<string, CacheEntry>();

export interface TrafficMatrixParams {
  origin: { lat: number; lon: number };
  destinations: TrafficMatrixDestination[];
  departureTime?: Date;
}

export async function getTrafficMatrix(
  params: TrafficMatrixParams
): Promise<TrafficMatrixEntry[]> {
  if (params.destinations.length === 0) {
    return [];
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable");
  }

  const departure = params.departureTime ?? new Date();
  const departureEpoch = Math.floor(departure.getTime() / 1000);
  const cacheKey = buildCacheKey(params.origin, params.destinations, departureEpoch);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const entries: TrafficMatrixEntry[] = [];
  const destinationChunks = chunkDestinations(params.destinations, MAX_DESTINATIONS_PER_REQUEST);

  for (const chunk of destinationChunks) {
    const url = new URL(DISTANCE_MATRIX_URL);
    url.searchParams.set("origins", formatLatLon(params.origin.lat, params.origin.lon));
    url.searchParams.set("destinations", chunk.map((dest) => formatLatLon(dest.lat, dest.lon)).join("|"));
    url.searchParams.set("departure_time", departureEpoch.toString());
    url.searchParams.set("traffic_model", "best_guess");
    url.searchParams.set("units", "metric");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Google Maps Distance Matrix HTTP ${res.status}`);
    }

    const payload = (await res.json()) as any;
    if (payload.status !== "OK") {
      throw new Error(
        `Google Maps Distance Matrix error: ${payload.status}${
          payload.error_message ? ` (${payload.error_message})` : ""
        }`
      );
    }

    const row = payload.rows?.[0];
    if (!row || !Array.isArray(row.elements)) {
      throw new Error("Google Maps Distance Matrix returned no rows");
    }

    row.elements.forEach((element: any, idx: number) => {
      const dest = chunk[idx];
      entries.push({
        zoneId: dest.zoneId,
        distanceMeters: sanitizeNumber(element.distance?.value),
        durationSeconds: sanitizeNumber(element.duration?.value),
        durationInTrafficSeconds: sanitizeNumber(element.duration_in_traffic?.value),
        status: element.status ?? "UNKNOWN",
      });
    });
  }

  responseCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: entries,
  });

  return entries;
}

function sanitizeNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatLatLon(lat: number, lon: number) {
  return `${lat},${lon}`;
}

function chunkDestinations<T>(input: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < input.length; i += size) {
    chunks.push(input.slice(i, i + size));
  }
  return chunks;
}

function buildCacheKey(
  origin: { lat: number; lon: number },
  destinations: TrafficMatrixDestination[],
  departureEpoch: number
) {
  const originKey = `${origin.lat.toFixed(CACHE_COORD_PRECISION)},${origin.lon.toFixed(
    CACHE_COORD_PRECISION
  )}`;
  const destKey = destinations
    .map(
      (dest) =>
        `${dest.zoneId}:${dest.lat.toFixed(CACHE_COORD_PRECISION)},${dest.lon.toFixed(
          CACHE_COORD_PRECISION
        )}`
    )
    .sort()
    .join("|");
  const timeBucket = Math.floor(departureEpoch / 60); // 1-minute buckets
  return `${originKey}|${destKey}|${timeBucket}`;
}
