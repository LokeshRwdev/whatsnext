import type { PostgrestError } from "@supabase/supabase-js";
import { ok, bad } from "@/lib/api-respond";
import { RideEventIngestSchema } from "@/lib/zod-schemas";
import { ingestRideEvent } from "@/lib/server/ride-event-ingest";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function POST(req: Request) {
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

  let body: unknown = null;
  try {
    body = await req.json();
  } catch (error) {
    return bad(
      "Request body must be valid JSON",
      serializeError(error),
      400,
      "INVALID_JSON"
    );
  }

  const logContext = {
    userId: user.id,
  };

  try {
    const payload = RideEventIngestSchema.parse(body);
    const result = await ingestRideEvent({
      supabase,
      driverId: user.id,
      payload,
    });

    return ok({
      ok: true,
      event_id: result.eventId,
      pickup_zone: result.pickupZoneId,
      drop_zone: result.dropZoneId,
      occurred_at: result.occurredAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return bad("Invalid input", error.flatten(), 400, "INVALID_INPUT");
    }

    if (isPostgrestError(error)) {
      console.error("[ride-events/ingest] DB error", {
        ...logContext,
        payload: body,
        error,
      });
      return Response.json(
        {
          error: {
            code: "DB_ERROR",
            message: "Failed to insert ride event",
            details: formatPostgrestError(error),
          },
        },
        { status: 500 }
      );
    }

    console.error("[ride-events/ingest] failed", {
      ...logContext,
      payload: body,
      error,
    });

    return bad(
      error instanceof Error ? error.message : "Unexpected error",
      serializeError(error),
      500,
      "INTERNAL_ERROR"
    );
  }
}

function serializeError(error: unknown) {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    const extras =
      typeof error === "object"
        ? Object.fromEntries(
            Object.entries(error as unknown as Record<string, unknown>)
          )
        : {};

    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack } : {}),
      ...extras,
    };
  }

  if (typeof error === "object") {
    return error;
  }

  return { message: String(error) };
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    "message" in error
  );
}

function formatPostgrestError(error: PostgrestError) {
  return {
    code: error.code,
    message: error.message,
    details: error.details ?? null,
    hint: error.hint ?? null,
  };
}
