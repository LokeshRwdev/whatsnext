"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const supabase = createBrowserSupabaseClient();

export type RideEventType =
  | "booking_received"
  | "ride_started"
  | "ride_completed"
  | "booking_cancelled";

export type RideEventPayload = {
  event_type: RideEventType;
  occurred_at?: string; // ISO datetime
  lat?: number | null;
  lon?: number | null;
  battery_pct?: number | null;
};

/**
 * Send a ride event to the Supabase Edge Function via SDK.
 * This replaces direct fetch() calls to /functions/v1/ingest_ride_event.
 * 
 * @param payload - The ride event data
 * @returns { ok: boolean, data?: any, error?: string }
 */
export async function sendRideEvent(payload: RideEventPayload) {
  // Ensure user session so RLS + auth.uid() work
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.error("[sendRideEvent] No session; user must be logged in.");
    return { ok: false, error: "UNAUTHORIZED" };
  }

  try {
    const { data, error } = await supabase.functions.invoke(
      "ingest_ride_event",
      {
        body: payload,
      }
    );

    if (error) {
      console.error("[sendRideEvent] Supabase function error:", error);
      return { ok: false, error: error.message ?? "FUNCTION_ERROR" };
    }

    console.log("[sendRideEvent] Success:", data);
    return { ok: true, data };
  } catch (e: any) {
    console.error("[sendRideEvent] Unexpected error:", e);
    return { ok: false, error: e?.message ?? "UNKNOWN_ERROR" };
  }
}
