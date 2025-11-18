"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

export function useDriverProfile() {
  const [profile, setProfile] = useState<{ id: string; full_name: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setProfile({ id: user.id, full_name: data?.full_name ?? user.user_metadata?.full_name ?? null });
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return profile;
}
