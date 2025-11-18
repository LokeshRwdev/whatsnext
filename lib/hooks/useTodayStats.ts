"use client";

import { useCallback, useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

type TripRow = {
  pickup_at: string | null;
  drop_at: string | null;
  fare_inr: number | null;
  tip_inr: number | null;
};

export interface TodayStats {
  totalTrips: number;
  totalEarnings: number;
  totalHours: number;
  idleMinutes: number;
}

export function useTodayStats() {
  const [stats, setStats] = useState<TodayStats>({
    totalTrips: 0,
    totalEarnings: 0,
    totalHours: 0,
    idleMinutes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = startOfDay(new Date());
    const end = new Date();
    const { data: trips, error: tripsError } = await supabase
      .from("trips")
      .select("pickup_at,drop_at,fare_inr,tip_inr")
      .gte("pickup_at", start.toISOString())
      .lte("pickup_at", end.toISOString());
    if (tripsError) {
      setError(tripsError.message);
    }

    let totalTrips = trips?.length ?? 0;
    let totalEarnings = 0;
    let totalHours = 0;
    trips?.forEach((trip: TripRow) => {
      totalEarnings += (trip.fare_inr ?? 0) + (trip.tip_inr ?? 0);
      const pickup = trip.pickup_at ? Date.parse(trip.pickup_at) : 0;
      const drop = trip.drop_at ? Date.parse(trip.drop_at) : pickup;
      totalHours += Math.max(0, drop - pickup) / (1000 * 60 * 60);
    });

    const { data: opsRow } = await supabase
      .from("ops_daily")
      .select("idle_minutes")
      .eq("day", start.toISOString().slice(0, 10))
      .maybeSingle();

    setStats({
      totalTrips,
      totalEarnings,
      totalHours,
      idleMinutes: opsRow?.idle_minutes ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { stats, loading, error, refresh: load };
}
