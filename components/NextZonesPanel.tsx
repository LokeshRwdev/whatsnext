"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecommendationResponse, type DriverState } from "@/lib/api-client";
import { useDriverState } from "@/lib/hooks/useDriverState";
import { useTrackingStore } from "@/lib/tracking/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MapPin, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CurrentLocation } from "@/hooks/useLiveTracking";
import { useZones } from "@/hooks/useZones";
import { computeNearestZones } from "@/lib/nearest-zones";

interface NextZonesPanelProps {
  trackingOn: boolean;
  hasLocation: boolean;
  isFetchingLocation: boolean;
  currentLoc: CurrentLocation | null;
  seedRecommendation?: RecommendationResponse | null;
  allowLowAccuracy?: boolean;
  onAllowLowAccuracy?: () => void;
}

const STALE_MS = 45_000;
const AUTO_REFRESH_MS = 180_000; // 3 minutes

export function NextZonesPanel({
  trackingOn,
  hasLocation,
  isFetchingLocation,
  currentLoc,
  seedRecommendation,
  allowLowAccuracy,
  onAllowLowAccuracy,
}: NextZonesPanelProps) {
  const { data: driverState } = useDriverState();
  const { zones } = useZones();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(
    seedRecommendation ?? null
  );
  const [loading, setLoading] = useState(!seedRecommendation);
  const [error, setError] = useState<string | null>(null);
  const setTrackingRecommendation = useTrackingStore((s) => s.setRecommendation);
  const lastFix = useTrackingStore((s) => s.lastFix);
  const lastFixRef = useRef(lastFix);
  const lastFetchAtRef = useRef(0);
  const currentLocRef = useRef<CurrentLocation | null>(currentLoc);
  const hasLocationRef = useRef(hasLocation);
  const lastFetchedCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFetchTriggeredRef = useRef(false);

  useEffect(() => {
    lastFixRef.current = lastFix;
  }, [lastFix]);

  useEffect(() => {
    currentLocRef.current = currentLoc;
  }, [currentLoc]);

  useEffect(() => {
    hasLocationRef.current = hasLocation;
  }, [hasLocation]);

  const fallbackLocation = useMemo(() => selectBestLocation(currentLoc, driverState), [currentLoc, driverState]);

  const syncRecommendation = useCallback(
    (next: RecommendationResponse | null) => {
      setRecommendation(next);
      setTrackingRecommendation(next);
    },
    [setTrackingRecommendation]
  );

  const buildLocalRecommendation = useCallback(
    (
      coords: { lat: number; lon: number },
      meta: { origin: "live_fix" | "driver_state_coords" | "driver_state_loc"; trigger: string }
    ): RecommendationResponse | null => {
      if (!zones.length) return null;
      const { results } = computeNearestZones(zones, coords, {
        limit: 3,
        origin: meta.origin,
      });
      const top = results.map((zone) => ({
        zone_id: zone.zone_id,
        zone_name: zone.zone_name,
        lat: zone.lat,
        lon: zone.lon,
        distance_km: Number(zone.distance_km.toFixed(2)),
        eta_min: zone.eta_min,
        score: zone.score,
        reason: zone.reason,
        traffic_speed_idx: null,
      }));

      return {
        computed_at: new Date().toISOString(),
        source: "local",
        traffic_source: "fallback",
        context: {
          reason: top.length ? "local_inference" : "no_zones_in_db",
          origin: meta.origin,
          trigger: meta.trigger,
        },
        top,
      };
    },
    [zones]
  );

  useEffect(() => {
    if (!fallbackLocation) return;
    if (recommendation?.top?.length) return;
    const seeded = buildLocalRecommendation(fallbackLocation.coords, {
      origin: fallbackLocation.source,
      trigger: "driver_state_seed",
    });
    if (seeded && seeded.top.length) {
      setError(null);
      setLoading(false);
      syncRecommendation(seeded);
    }
  }, [fallbackLocation, recommendation, buildLocalRecommendation, syncRecommendation]);

  const hydrateFromState = useCallback(() => {
    if (driverState?.recommendation) {
      const rec = driverState.recommendation;
      if (Date.now() - Date.parse(rec.computed_at) < STALE_MS) {
        syncRecommendation(rec);
        setError(null);
        setLoading(false);
        return true;
      }
    }
    return false;
  }, [driverState, syncRecommendation]);

  const fetchLatest = useCallback(
    async (reason: string = "manual") => {
      const loc = currentLocRef.current;
      if (!loc || !hasLocationRef.current) {
        setLoading(false);
        return;
      }

      lastFetchAtRef.current = Date.now();
      lastFetchedCoordsRef.current = { lat: loc.lat, lon: loc.lon };
      setLoading(true);
      setError(null);

      const localRecommendation = buildLocalRecommendation(
        { lat: loc.lat, lon: loc.lon },
        { origin: "live_fix", trigger: reason }
      );

      if (!localRecommendation || localRecommendation.top.length === 0) {
        setError("No zones with coordinates are configured yet.");
      } else {
        setError(null);
        syncRecommendation(localRecommendation);
      }
      setLoading(false);
    },
    [buildLocalRecommendation, syncRecommendation]
  );

  useEffect(() => {
    if (!seedRecommendation && hasLocation) {
      if (!hydrateFromState()) {
        fetchLatest("initial_state");
      }
    }
  }, [seedRecommendation, hasLocation, hydrateFromState, fetchLatest]);

  const requestRefresh = useCallback(
    (reason: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void fetchLatest(reason);
      }, 800);
    },
    [fetchLatest]
  );

  useEffect(() => {
    if (!hasLocation) {
      initialFetchTriggeredRef.current = false;
    }
  }, [hasLocation]);

  // Kick off the first fetch as soon as we have a good GPS fix
  useEffect(() => {
    if (!hasLocation || !currentLoc) return;
    if (!initialFetchTriggeredRef.current) {
      initialFetchTriggeredRef.current = true;
      void fetchLatest("first_fix");
    }
  }, [hasLocation, currentLoc, fetchLatest]);

  // Refresh when the driver moves ~50m or every 15s while tracking
  useEffect(() => {
    if (!hasLocation || !currentLoc || !initialFetchTriggeredRef.current) return;
    const lastCoords = lastFetchedCoordsRef.current;
    const now = Date.now();
    const movedMeters = lastCoords
      ? distanceBetweenMeters(lastCoords.lat, lastCoords.lon, currentLoc.lat, currentLoc.lon)
      : Infinity;

    if (
      !lastCoords ||
      movedMeters >= 50 ||
      now - lastFetchAtRef.current >= 15_000
    ) {
      requestRefresh("movement_or_interval");
    }
  }, [hasLocation, currentLoc, requestRefresh]);

  useEffect(() => {
    hydrateFromState();
  }, [driverState, hydrateFromState]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      seedRecommendation &&
      (!recommendation ||
        seedRecommendation.computed_at !== recommendation.computed_at)
    ) {
      syncRecommendation(seedRecommendation);
    }
  }, [seedRecommendation, recommendation, syncRecommendation]);

  const runAutoRefresh = useCallback(() => {
    if (!hasLocationRef.current) return;
    const now = Date.now();
    if (now - lastFetchAtRef.current < AUTO_REFRESH_MS) {
      return;
    }
    void fetchLatest("auto_refresh");
  }, [fetchLatest]);

  useEffect(() => {
    if (!trackingOn || !hasLocation) return;
    runAutoRefresh();
    const id = setInterval(runAutoRefresh, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [trackingOn, hasLocation, runAutoRefresh]);

  const hasServerResults = Boolean(recommendation?.top && recommendation.top.length > 0);
  const empty = !loading && !error && !hasServerResults;
  const waitingForGps = trackingOn && !hasLocation;
  const rawAccuracy = currentLoc?.accuracy_m ?? lastFix?.accuracy ?? null;
  const gpsAccuracy = typeof rawAccuracy === "number" ? rawAccuracy : null;
  const computedAgo = recommendation?.computed_at
    ? formatDistanceToNow(new Date(recommendation.computed_at), { addSuffix: true })
    : null;
  const context = recommendation?.context as { traffic_speed_idx?: number; reason?: string } | undefined;
  const avgTrafficIdx =
    typeof context?.traffic_speed_idx === "number" ? context.traffic_speed_idx : null;
  const trafficSource = recommendation?.traffic_source ?? null;
  const contextReason = typeof context?.reason === "string" ? context.reason : undefined;

  const emptyStateContent = (() => {
    if (waitingForGps || isFetchingLocation) {
      return (
        <div>
          <p className="font-medium">Waiting for GPS fix...</p>
          <p className="mt-1 text-xs">
            Move outdoors for a clear sky view. Accuracy must be &lt;150m before we can plan zones.
          </p>
          {typeof gpsAccuracy === "number" && (
            <p className="mt-1 text-xs text-amber-600">Current accuracy: {gpsAccuracy.toFixed(0)}m</p>
          )}
          {!allowLowAccuracy && Boolean(onAllowLowAccuracy) && (
            <Button size="sm" variant="secondary" className="mt-3" onClick={onAllowLowAccuracy}>
              Use low-accuracy fix
            </Button>
          )}
        </div>
      );
    }
    if (contextReason === "no_zones_in_db") {
      return (
        <div>
          <p className="font-medium">No zones configured</p>
          <p className="mt-1 text-xs">
            Ask operations to seed the zones table. Recommendations need at least one zone.
          </p>
        </div>
      );
    }
    if (contextReason === "no_zones_with_coords") {
      return (
        <div>
          <p className="font-medium">Zones missing coordinates</p>
          <p className="mt-1 text-xs">
            None of the zones have lat/lon or center coordinates. Update them in Supabase.
          </p>
        </div>
      );
    }
    return "We'll start suggesting zones once we see your location.";
  })();
  const headerMeta = useMemo(() => {
    const parts = [
      computedAgo ? `Refreshed ${computedAgo}` : "Refreshed just now",
      describeTrafficSource(trafficSource),
      avgTrafficIdx !== null ? `Avg traffic ${describeTrafficLevel(avgTrafficIdx)}` : null,
    ];
    return parts.filter(Boolean).join(" | ");
  }, [computedAgo, trafficSource, avgTrafficIdx]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold">Next best zones</CardTitle>
          <p className="text-xs text-muted-foreground">{headerMeta}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Refresh"
          onClick={() => fetchLatest("manual_button")}
          disabled={!hasLocation || isFetchingLocation}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="rounded-xl border p-3">
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onClick={() => fetchLatest("retry")}
              disabled={isFetchingLocation || !hasLocation}
            >
              Try again
            </Button>
          </div>
        )}

        {empty && (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            {emptyStateContent}
          </div>
        )}

        {!loading && !error && recommendation?.top?.length ? (
          <div className="space-y-3">
            {recommendation.top.map((zone) => (
              <ZoneCard key={zone.zone_id} zone={zone} />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type DerivedLocation = {
  coords: { lat: number; lon: number };
  source: "live_fix" | "driver_state_coords" | "driver_state_loc";
};

function selectBestLocation(currentLoc: CurrentLocation | null, driverState: DriverState | null): DerivedLocation | null {
  if (currentLoc) {
    return { coords: { lat: currentLoc.lat, lon: currentLoc.lon }, source: "live_fix" };
  }
  if (!driverState) return null;

  if (typeof driverState.lat === "number" && typeof driverState.lon === "number") {
    return { coords: { lat: driverState.lat, lon: driverState.lon }, source: "driver_state_coords" };
  }

  const coordsField = (driverState as DriverState & { coords?: { lat?: number; lon?: number } | null })?.coords;
  if (coordsField && typeof coordsField.lat === "number" && typeof coordsField.lon === "number") {
    return { coords: { lat: coordsField.lat, lon: coordsField.lon }, source: "driver_state_coords" };
  }

  const locPoint = driverState.loc as { coordinates?: [number, number] } | null;
  if (locPoint && Array.isArray(locPoint.coordinates) && locPoint.coordinates.length === 2) {
    const [lon, lat] = locPoint.coordinates;
    if (typeof lat === "number" && typeof lon === "number") {
      return { coords: { lat, lon }, source: "driver_state_loc" };
    }
  }

  return null;
}

function ZoneCard({ zone }: { zone: RecommendationResponse["top"][number] }) {
  const hasScore = typeof zone.score === "number";
  const hasEta = typeof zone.eta_min === "number";
  const hasDistance = typeof zone.distance_km === "number";
  const distanceLabel = hasDistance ? `${zone.distance_km!.toFixed(1)} km` : "Distance n/a";
  const etaLabel = hasEta ? `${zone.eta_min} min` : "ETA n/a";
  const scoreLabel = hasScore ? zone.score!.toFixed(2) : "Score n/a";
  const barWidth = hasScore ? `${Math.min(100, Math.round(zone.score! * 100))}%` : "0%";

  const handleNavigate = () => {
    const q = encodeURIComponent(`${zone.zone_name} Patna`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  const trafficLabel =
    typeof zone.traffic_speed_idx === "number"
      ? describeTrafficLevel(zone.traffic_speed_idx)
      : null;

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            {zone.zone_name}
          </div>
          <p className="text-xs text-muted-foreground">
            {distanceLabel} | {etaLabel} | {scoreLabel}
          </p>
          {trafficLabel && (
            <p className="text-xs text-muted-foreground">Traffic: {trafficLabel}</p>
          )}
        </div>
        <Button size="sm" variant="secondary" onClick={handleNavigate}>
          Navigate
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">{zone.reason}</div>
      <div className="mt-3 h-1.5 rounded-full bg-muted">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: barWidth }} />
      </div>
    </div>
  );
}

function describeTrafficSource(source?: string | null) {
  if (source === "google") return "Google live traffic";
  if (source === "cache") return "Cached traffic snapshot";
  if (source === "fallback") return "Estimated traffic";
  return null;
}

function describeTrafficLevel(idx: number) {
  if (idx >= 0.85) return "Smooth";
  if (idx >= 0.65) return "Moderate";
  if (idx >= 0.4) return "Busy";
  return "Heavy";
}

function distanceBetweenMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
