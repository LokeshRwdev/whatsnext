import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GeoJsonPoint, latLonFromPoint } from "@/lib/server/geo-utils";

type DriverStateRow = {
  driver_id: string;
  last_ping_at: string | null;
  loc: GeoJsonPoint | null;
  snapped_zone: number | null;
  speed_kmh: number | null;
  battery_pct: number | null;
  recommendation: Record<string, unknown> | null;
  updated_at: string | null;
};

type LatestPingRow = {
  accuracy_m: number | null;
};

export async function GET() {
  try {
    const { supabase, user } = await createServerSupabaseClient();

    if (!user) {
      return Response.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Please sign in",
          },
        },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("driver_state")
      .select(
        "driver_id,last_ping_at,loc,snapped_zone,speed_kmh,battery_pct,recommendation,updated_at"
      )
      .eq("driver_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[driver-state] DB error", {
        userId: user.id,
        error,
      });
      return Response.json(
        {
          error: {
            code: "DB_ERROR",
            message: "Failed to fetch driver state",
            details: {
              code: error.code,
              message: error.message,
              details: error.details ?? null,
              hint: error.hint ?? null,
            },
          },
        },
        { status: 500 }
      );
    }

    if (!data) {
      return Response.json(
        {
          data: null,
          status: "NO_STATE",
          message: "No driver_state row found for this user yet",
        },
        { status: 200 }
      );
    }

    const row = data as DriverStateRow;
    const coords = latLonFromPoint(row.loc);
    let lastPingAccuracy: number | null = null;

    const {
      data: latestPing,
      error: latestPingError,
    } = await supabase
      .from("pings")
      .select("accuracy_m")
      .eq("driver_id", user.id)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPingError) {
      if (latestPingError.code !== "PGRST116") {
        console.error("[driver-state] latest ping lookup failed", {
          userId: user.id,
          error: latestPingError,
        });
      }
    } else if (latestPing) {
      const ping = latestPing as LatestPingRow;
      if (typeof ping.accuracy_m === "number" && Number.isFinite(ping.accuracy_m)) {
        lastPingAccuracy = ping.accuracy_m;
      }
    }

    return Response.json(
      {
        data: {
          driver_id: row.driver_id,
          last_ping_at: row.last_ping_at,
          snapped_zone: row.snapped_zone,
          loc: row.loc,
          speed_kmh: row.speed_kmh,
          battery_pct: row.battery_pct,
          recommendation: row.recommendation,
          updated_at: row.updated_at,
          coords,
          last_ping_accuracy_m: lastPingAccuracy,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[driver-state] unexpected failure", error);
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch driver state",
        },
      },
      { status: 500 }
    );
  }
}
