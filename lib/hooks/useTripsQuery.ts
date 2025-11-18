"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useZonesLookup } from "@/lib/hooks/useZonesLookup";

const supabase = createBrowserSupabaseClient();

export type TripRow = {
  id: number;
  pickup_at: string;
  drop_at: string;
  platform: "ola" | "uber";
  pickup_zone: number | null;
  drop_zone: number | null;
  fare_inr: number | null;
  distance_km: number | null;
  tip_inr: number | null;
  deadhead_km: number | null;
};

export interface UseTripsQueryParams {
  from: Date;
  to: Date;
  platform?: "all" | "ola" | "uber";
}

export function useTripsQuery({ from, to, platform = "all" }: UseTripsQueryParams) {
  const zones = useZonesLookup();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("trips")
      .select(
        "id,pickup_at,drop_at,platform,pickup_zone,drop_zone,fare_inr,distance_km,tip_inr,deadhead_km"
      )
      .order("pickup_at", { ascending: false })
      .gte("pickup_at", from.toISOString())
      .lte("pickup_at", to.toISOString())
      .limit(100);

    if (platform !== "all") {
      query = query.eq("platform", platform);
    }

    const { data, error } = await query;
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setTrips(data ?? []);
    }
    setLoading(false);
  }, [from, to, platform]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (!trips.length) {
      return {
        totalTrips: 0,
        totalEarnings: 0,
        totalHours: 0,
        deadheadKm: 0,
      };
    }
    return trips.reduce(
      (acc, trip) => {
        acc.totalTrips += 1;
        acc.totalEarnings += (trip.fare_inr ?? 0) + (trip.tip_inr ?? 0);
        const pickup = trip.pickup_at ? Date.parse(trip.pickup_at) : 0;
        const drop = trip.drop_at ? Date.parse(trip.drop_at) : pickup;
        acc.totalHours += Math.max(0, drop - pickup) / (1000 * 60 * 60);
        acc.deadheadKm += trip.deadhead_km ?? 0;
        return acc;
      },
      { totalTrips: 0, totalEarnings: 0, totalHours: 0, deadheadKm: 0 }
    );
  }, [trips]);

  const tripsWithNames = useMemo(
    () =>
      trips.map((trip) => ({
        ...trip,
        pickup_zone_name: trip.pickup_zone ? zones[trip.pickup_zone] ?? `Zone ${trip.pickup_zone}` : "",
        drop_zone_name: trip.drop_zone ? zones[trip.drop_zone] ?? `Zone ${trip.drop_zone}` : "",
      })),
    [trips, zones]
  );

  return {
    trips: tripsWithNames,
    loading,
    error,
    stats,
    refresh: load,
  };
}
