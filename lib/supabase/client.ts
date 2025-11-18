"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient() {
  if (typeof window === "undefined") {
    // Return a placeholder during SSR - actual client will be created on hydration
    return null as any;
  }

  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseConfig();
  browserClient = createBrowserClient(url, anonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

export function getBrowserSupabaseClient() {
  return createBrowserSupabaseClient();
}
