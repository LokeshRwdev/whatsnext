import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GeoJsonPoint, latLonFromPoint } from "@/lib/server/geo-utils";

type DriverStateRow = {
  driver_id: string;
  last_ping_at: string | null;
  loc: GeoJsonPoint | null;
  snapped_zone: number | null;
  speed_kmh: number | null;
  battery_pct: number | null;
  accuracy_m: number | null;
  recommendation: Record<string, unknown> | null;
  updated_at: string | null;
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
        "driver_id,last_ping_at,loc,snapped_zone,speed_kmh,battery_pct,accuracy_m,recommendation,updated_at"
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

    return Response.json(
      {
        data: {
          driver_id: row.driver_id,
          last_ping_at: row.last_ping_at,
          snapped_zone: row.snapped_zone,
          loc: row.loc,
          speed_kmh: row.speed_kmh,
          battery_pct: row.battery_pct,
          accuracy_m: row.accuracy_m ?? null,
          recommendation: row.recommendation,
          updated_at: row.updated_at,
          coords,
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
