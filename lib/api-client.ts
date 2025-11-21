export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

async function parseJson<T>(res: Response): Promise<T | null> {
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return null;
}

async function handleResponse<T>(
  res: Response
): Promise<{ data: T | null; error: ApiError | null }> {
  if (res.ok) {
    const data = await parseJson<T>(res);
    return { data, error: null };
  }

  const payload =
    (await parseJson<{ error?: { code: string; message: string; details?: unknown } }>(
      res
    )) || undefined;

  const error: ApiError = {
    code: payload?.error?.code || `HTTP_${res.status}`,
    message: payload?.error?.message || res.statusText,
    details: payload?.error?.details,
  };
  return { data: null, error };
}

export async function apiGet<T>(url: string) {
  const res = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T, B = unknown>(url: string, body: B) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export type RecommendationZone = {
  zone_id: string | number;
  zone_name: string;
  lat: number;
  lon: number;
  distance_km: number;
  eta_min: number;
  score: number;
  reason: string;
  success_prob?: number;
  expected_fare_inr?: number;
  normalized_fare?: number;
  traffic_penalty?: number;
  traffic_speed_idx?: number | null;
};

export type RecommendationResponse = {
  computed_at: string;
  source?: string;
  traffic_source?: "google" | "cache" | "fallback" | null;
  context?: Record<string, unknown> | null;
  top: RecommendationZone[];
};

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
  crs?: { type: string; properties: Record<string, any> };
};

export type DriverState = {
  driver_id: string;
  last_ping_at: string | null;
  loc: GeoPoint | null;
  lat: number | null;
  lon: number | null;
  snapped_zone: number | null;
  speed_kmh: number | null;
  battery_pct: number | null;
  last_ping_accuracy_m: number | null;
  recommendation: RecommendationResponse | null;
  updated_at: string | null;
  coords?: { lat: number; lon: number } | null;
};

export type DriverStateResponse = {
  data: DriverState | null;
  status?: string;
  message?: string;
} | null;

export type PingPayload = {
  lat: number;
  lon: number;
  ts?: string;
  accuracy_m?: number | null;
  speed_kmh?: number | null;
  battery_pct?: number | null;
  traffic_context?: Record<string, unknown>;
};

export async function postPing(payload: PingPayload) {
  return apiPost<{ zone_id: number | null; recommendation: RecommendationResponse | null }>(
    "/api/pings",
    payload
  );
}

export async function fetchDriverState() {
  return apiGet<DriverStateResponse>("/api/driver-state");
}

export async function fetchRecommendations(params?: {
  lat?: number;
  lon?: number;
  k?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.lat !== undefined) qs.set("lat", String(params.lat));
  if (params?.lon !== undefined) qs.set("lon", String(params.lon));
  if (params?.k !== undefined) qs.set("k", String(params.k));
  const suffix = qs.toString();
  return apiGet<RecommendationResponse>(
    `/api/recommendations/next-spot${suffix ? `?${suffix}` : ""}`
  );
}

export type RideEventPayload = {
  event_type: "booking_received" | "ride_started" | "ride_completed" | "booking_cancelled";
  platform: "ola" | "uber";
  pickup_lat?: number;
  pickup_lon?: number;
  drop_lat?: number;
  drop_lon?: number;
  surge_multiplier?: number;
  promo_code?: string;
};

export async function postRideEvent(payload: RideEventPayload) {
  return apiPost<{ ok: boolean; event_id: number | null }>("/api/ride-events/ingest", {
    occurred_at: new Date().toISOString(),
    ...payload,
  });
}

export type OpsDailyInput = {
  day?: string;
  platforms?: ("ola" | "uber")[];
  idle_minutes?: number;
  energy_kwh?: number;
  energy_cost_inr?: number;
  fuel_litres?: number;
  fuel_cost_inr?: number;
  tolls_parking_inr?: number;
  notes?: string;
};

export async function upsertOpsDaily(payload: OpsDailyInput) {
  return apiPost<{
    driver_id: string;
    day: string;
    idle_minutes: number | null;
    energy_kwh: number | null;
    energy_cost_inr: number | null;
    tolls_parking_inr: number | null;
    notes: string | null;
  }>("/api/ops-daily/upsert", payload);
}

export type TripSyncPayload = {
  booking_at?: string;
  pickup_at: string;
  drop_at: string;
  pickup_lat: number;
  pickup_lon: number;
  drop_lat: number;
  drop_lon: number;
  distance_km: number;
  fare_inr: number;
  platform: "ola" | "uber";
  surge_multiplier?: number;
  promo_code?: string;
  tip_inr?: number;
};

export async function postTripSync(payload: TripSyncPayload) {
  return apiPost<{ trip_id: number | null }>("/api/trips/sync", payload);
}
