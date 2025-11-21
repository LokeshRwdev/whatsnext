"use client";

import { useCallback, useEffect, useState } from "react";
import { DriverState, type DriverStateResponse, fetchDriverState } from "@/lib/api-client";

function unwrapDriverState(payload: DriverStateResponse | DriverState | null): DriverState | null {
  if (!payload) return null;
  if (typeof (payload as DriverStateResponse)?.data !== "undefined") {
    return (payload as DriverStateResponse)?.data ?? null;
  }
  return payload as DriverState;
}

export function useDriverState(pollMs: number = 0) {
  const [data, setData] = useState<DriverState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await fetchDriverState();
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setData(unwrapDriverState(data ?? null));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    if (pollMs > 0) {
      const id = setInterval(load, pollMs);
      return () => clearInterval(id);
    }
  }, [load, pollMs]);

  return { data, loading, error, refresh: load };
}
