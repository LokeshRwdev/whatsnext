"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

export function useZonesLookup() {
  const [zones, setZones] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.from("zones").select("id,name");
      if (!active || !data) return;
      const map: Record<number, string> = {};
      for (const row of data) {
        map[row.id] = row.name;
      }
      setZones(map);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return zones;
}
