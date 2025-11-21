"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openDB, type IDBPDatabase } from "idb";
import type { GeoPoint } from "@/lib/api-client";

export type ZoneRow = {
  id: string | number;
  name: string;
  lat?: number | null;
  lon?: number | null;
  center?: GeoPoint | null;
  radius_km?: number | null;
  weight_demand?: number | null;
  is_active?: boolean | null;
};

const DB_NAME = "whatsnext-local";
const DB_VERSION = 1;
const STORE_ZONES = "zones";
const CACHE_KEY = "all";

async function getZonesDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_ZONES)) {
        db.createObjectStore(STORE_ZONES);
      }
    },
  });
}

async function readCachedZones(db: IDBPDatabase, key: string) {
  try {
    return ((await db.get(STORE_ZONES, key)) as ZoneRow[]) ?? null;
  } catch (error) {
    console.warn("[useZones] failed to read cache", error);
    return null;
  }
}

async function writeCachedZones(db: IDBPDatabase, key: string, zones: ZoneRow[]) {
  try {
    await db.put(STORE_ZONES, zones, key);
  } catch (error) {
    console.warn("[useZones] failed to write cache", error);
  }
}

export function useZones() {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<IDBPDatabase | null>(null);
  const fetchedOnceRef = useRef(false);

  const fetchZones = useCallback(
    async (opts?: { background?: boolean }) => {
      if (!opts?.background) {
        setLoading(true);
      }
      try {
        const res = await fetch("/api/zones", { credentials: "include" });
        const payload = (await res.json().catch(() => null)) as { data: ZoneRow[] } | null;
        if (!res.ok || !payload) {
          throw new Error(
            (payload as any)?.error?.message ?? res.statusText ?? "Failed to fetch zones"
          );
        }
        setZones(payload.data ?? []);
        setError(null);
        fetchedOnceRef.current = true;
        if (!dbRef.current) {
          dbRef.current = await getZonesDB();
        }
        await writeCachedZones(dbRef.current, CACHE_KEY, payload.data ?? []);
        console.log("[useZones] zones_fetched", {
          count: payload.data?.length ?? 0,
        });
      } catch (err) {
        console.error("[useZones] fetch failed", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      dbRef.current = await getZonesDB();
      const cached = await readCachedZones(dbRef.current, CACHE_KEY);
      if (!active) return;
      if (cached && cached.length > 0) {
        setZones(cached);
        setLoading(false);
        console.log("[useZones] cache_hit", { count: cached.length });
        fetchZones({ background: true });
      } else {
        fetchZones();
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchZones]);

  const refetch = useCallback(() => fetchZones(), [fetchZones]);

  return {
    zones,
    loading,
    error,
    refetch,
    hasData: zones.length > 0,
    fetchedOnce: fetchedOnceRef.current,
  };
}
