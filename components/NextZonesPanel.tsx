"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecommendationResponse, fetchRecommendations } from "@/lib/api-client";
import { useDriverState } from "@/lib/hooks/useDriverState";
import { useTrackingStore } from "@/lib/tracking/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MapPin, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NextZonesPanelProps {
  trackingOn: boolean;
  seedRecommendation?: RecommendationResponse | null;
}

const STALE_MS = 45_000;
const AUTO_REFRESH_MS = 180_000; // 3 minutes

export function NextZonesPanel({ trackingOn, seedRecommendation }: NextZonesPanelProps) {
  const { data: driverState } = useDriverState();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(
    seedRecommendation ?? null
  );
  const [loading, setLoading] = useState(!seedRecommendation);
  const [error, setError] = useState<string | null>(null);
  const setTrackingRecommendation = useTrackingStore((s) => s.setRecommendation);
  const lastFix = useTrackingStore((s) => s.lastFix);
  const lastFixRef = useRef(lastFix);
  const lastFetchAtRef = useRef(0);

  useEffect(() => {
    lastFixRef.current = lastFix;
  }, [lastFix]);

  const syncRecommendation = useCallback(
    (next: RecommendationResponse | null) => {
      setRecommendation(next);
      setTrackingRecommendation(next);
    },
    [setTrackingRecommendation]
  );

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

  const fetchLatest = useCallback(async () => {
    const loc = lastFixRef.current;
    
    // GATING: Do not fetch if we don't have a valid location
    if (!loc || typeof loc.accuracy !== "number" || loc.accuracy > 100) {
      setError(
        "Waiting for GPS fix (accuracy <100m). Move outdoors for better signal."
      );
      setLoading(false);
      return;
    }

    lastFetchAtRef.current = Date.now();
    setLoading(true);
    const params: { k: number; lat: number; lon: number } = {
      k: 3,
      lat: loc.lat,
      lon: loc.lon,
    };

    const { data, error } = await fetchRecommendations(params);
    if (error) {
      if (error.code === "NO_STATE") {
        setError(
          "We couldn't get your current location. Enable live tracking or share location to see zone recommendations."
        );
      } else {
        setError(error.message);
      }
    } else {
      setError(null);
      syncRecommendation(data);
    }
    setLoading(false);
  }, [syncRecommendation]);

  useEffect(() => {
    if (!seedRecommendation) {
      if (!hydrateFromState()) {
        fetchLatest();
      }
    }
  }, [seedRecommendation, hydrateFromState, fetchLatest]);

  useEffect(() => {
    hydrateFromState();
  }, [driverState, hydrateFromState]);

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
    const now = Date.now();
    if (now - lastFetchAtRef.current < AUTO_REFRESH_MS) {
      return;
    }
    void fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    if (!trackingOn) return;
    runAutoRefresh();
    const id = setInterval(runAutoRefresh, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [trackingOn, runAutoRefresh]);

  const empty =
    !loading && !error && (!recommendation || !recommendation.top || recommendation.top.length === 0);
  const waitingForGps =
    trackingOn &&
    (!lastFix || typeof lastFix.accuracy !== "number" || lastFix.accuracy > 100);
  const computedAgo = recommendation?.computed_at
    ? formatDistanceToNow(new Date(recommendation.computed_at), { addSuffix: true })
    : null;

  const context = recommendation?.context as { traffic_speed_idx?: number } | undefined;
  const avgTrafficIdx =
    typeof context?.traffic_speed_idx === "number" ? context.traffic_speed_idx : null;
  const trafficSource = recommendation?.traffic_source ?? null;
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
        <Button variant="ghost" size="icon" aria-label="Refresh" onClick={fetchLatest}>
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
            <Button size="sm" variant="secondary" className="mt-3" onClick={fetchLatest}>
              Try again
            </Button>
          </div>
        )}

        {empty && (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            {waitingForGps ? (
              <div>
                <p className="font-medium">Waiting for GPS fix...</p>
                <p className="mt-1 text-xs">
                  Move outdoors for clear sky view. Accuracy must be &lt;100m.
                </p>
                {lastFix?.accuracy && (
                  <p className="mt-1 text-xs text-amber-600">
                    Current accuracy: {lastFix.accuracy.toFixed(0)}m
                  </p>
                )}
              </div>
            ) : (
              "We'll start suggesting zones once we see your location."
            )}
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
