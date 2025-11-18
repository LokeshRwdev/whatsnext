"use client";

import { useCallback, useEffect, useState } from "react";
import { DriverState, fetchDriverState } from "@/lib/api-client";

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
      setData(data);
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
