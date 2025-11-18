"use client";

import { useMemo, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { postRideEvent } from "@/lib/api-client";
import { useTrackingStore, type TrackingFix } from "@/lib/tracking/store";
import { toast } from "sonner";

type RideEventAction =
  | "booking_received"
  | "ride_started"
  | "ride_completed"
  | "booking_cancelled";

const events: Array<{ type: RideEventAction; label: string; variant: ButtonProps["variant"] }> = [
  { type: "booking_received", label: "Got a Ride", variant: "default" },
  { type: "ride_started", label: "Ride Started", variant: "secondary" },
  { type: "ride_completed", label: "Ride Completed", variant: "outline" },
  { type: "booking_cancelled", label: "Booking Cancelled", variant: "ghost" },
] as const;

type EventConfig = (typeof events)[number];

interface RideControlsProps {
  lastFix: TrackingFix | null;
}

export function RideControls({ lastFix }: RideControlsProps) {
  const [platform, setPlatform] = useState<"ola" | "uber">("ola");
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setIsDriving = useTrackingStore((s) => s.setIsDriving);

  const coordsCopy = useMemo(() => {
    if (!lastFix) return "No live GPS";
    return `${lastFix.lat.toFixed(4)}, ${lastFix.lon.toFixed(4)}`;
  }, [lastFix]);

  const confirmEvent = async () => {
    if (!activeEvent) return;
    setSubmitting(true);
    const payload: Parameters<typeof postRideEvent>[0] = {
      event_type: activeEvent.type,
      platform,
    };
    if (lastFix) {
      if (activeEvent.type === "ride_completed") {
        payload.drop_lat = lastFix.lat;
        payload.drop_lon = lastFix.lon;
      } else {
        payload.pickup_lat = lastFix.lat;
        payload.pickup_lon = lastFix.lon;
      }
    }
    const { error } = await postRideEvent(payload);
    setSubmitting(false);
    setActiveEvent(null);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${copyForEvent(activeEvent.type)} logged`);
      updateDrivingState(activeEvent.type, setIsDriving);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border bg-white/60 px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Current platform</p>
          <div className="mt-1 inline-flex gap-2 rounded-full bg-muted p-1">
            {["ola", "uber"].map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => setPlatform(provider as "ola" | "uber")}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  platform === provider
                    ? "bg-white text-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Last fix</p>
          <p className="font-semibold text-foreground">{coordsCopy}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {events.map((event) => (
          <Button
            key={event.type}
            className={event.type === "booking_received" ? "col-span-2 h-14 text-base" : "h-12"}
            variant={event.variant}
            onClick={() => setActiveEvent(event)}
          >
            {event.label}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Your live location is only used to suggest better zones and calculate your performance. It stays private to you.
      </p>

      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 pb-8">
          <div className="w-full max-w-md rounded-3xl bg-bg p-5 shadow-2xl">
            <p className="text-sm font-semibold text-muted-foreground">Confirm action</p>
            <h3 className="text-2xl font-semibold">{activeEvent.label}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Platform: <span className="font-medium capitalize">{platform}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Location: <span className="font-medium">{coordsCopy}</span>
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setActiveEvent(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmEvent} disabled={submitting}>
                {submitting ? "Saving." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function updateDrivingState(action: RideEventAction, setIsDriving: (next: boolean) => void) {
  switch (action) {
    case "ride_started":
      setIsDriving(true);
      return;
    case "ride_completed":
    case "booking_cancelled":
    case "booking_received":
      setIsDriving(false);
      return;
    default:
      return;
  }
}

function copyForEvent(type: EventConfig["type"]) {
  switch (type) {
    case "booking_received":
      return "Booking";
    case "ride_started":
      return "Ride start";
    case "ride_completed":
      return "Ride completion";
    case "booking_cancelled":
      return "Cancellation";
    default:
      return "Event";
  }
}
