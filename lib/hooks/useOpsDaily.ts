"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

export function useOpsDaily(day: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ops_daily")
      .select(
        "day,platforms,idle_minutes,energy_kwh,energy_cost_inr,fuel_litres,fuel_cost_inr,tolls_parking_inr,notes"
      )
      .eq("day", day)
      .maybeSingle();
    if (error && error.code !== "PGRST116") {
      setError(error.message);
    } else {
      setError(null);
      setData(data ?? null);
    }
    setLoading(false);
  }, [day]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
