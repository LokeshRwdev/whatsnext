"use client";

import { useMemo, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { postRideEvent } from "@/lib/api-client";
import { useTrackingStore, type TrackingFix } from "@/lib/tracking/store";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

type RideEventAction =
  | "booking_received"
  | "ride_started"
  | "ride_completed"
  | "booking_cancelled";

const events: Array<{ type: RideEventAction; label: string; variant: ButtonProps["variant"] }> = [
  { type: "booking_received", label: "Got a Ride", variant: "default" },
  { type: "ride_started", label: "Start Ride", variant: "default" },
  { type: "ride_completed", label: "Complete Ride", variant: "destructive" }, // Changed to destructive/prominent for completion
  { type: "booking_cancelled", label: "Cancel Booking", variant: "ghost" },
] as const;

type EventConfig = (typeof events)[number];
type RideState = "idle" | "booking" | "on_trip";

interface RideControlsProps {
  lastFix: TrackingFix | null;
}

export function RideControls({ lastFix }: RideControlsProps) {
  const [platform, setPlatform] = useState<"ola" | "uber">("ola");
  const [rideState, setRideState] = useState<RideState>("idle");
  const [activeEvent, setActiveEvent] = useState<EventConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setIsDriving = useTrackingStore((s) => s.setIsDriving);

  const coordsCopy = useMemo(() => {
    if (!lastFix) return "No live GPS";
    return `${lastFix.lat.toFixed(4)}, ${lastFix.lon.toFixed(4)}`;
  }, [lastFix]);

  const handleMainAction = () => {
    if (rideState === "idle") {
      setActiveEvent(events.find((e) => e.type === "booking_received")!);
    } else if (rideState === "booking") {
      setActiveEvent(events.find((e) => e.type === "ride_started")!);
    } else if (rideState === "on_trip") {
      setActiveEvent(events.find((e) => e.type === "ride_completed")!);
    }
  };

  const handleCancelAction = () => {
    setActiveEvent(events.find((e) => e.type === "booking_cancelled")!);
  };

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
      
      // State transitions
      if (activeEvent.type === "booking_received") {
        setRideState("booking");
        setIsDriving(false);
      } else if (activeEvent.type === "ride_started") {
        setRideState("on_trip");
        setIsDriving(true);
      } else if (activeEvent.type === "ride_completed") {
        setRideState("idle");
        setIsDriving(false);
      } else if (activeEvent.type === "booking_cancelled") {
        setRideState("idle");
        setIsDriving(false);
      }
    }
  };

  const getMainButtonLabel = () => {
    switch (rideState) {
      case "idle": return "Got a Ride";
      case "booking": return "Start Ride";
      case "on_trip": return "Complete Ride";
    }
  };

  const getMainButtonVariant = (): ButtonProps["variant"] => {
    switch (rideState) {
      case "idle": return "default"; // Green/Primary
      case "booking": return "secondary"; // Distinct from idle
      case "on_trip": return "destructive"; // Red/End action? Or maybe outline. Let's use default for now or specific style.
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
        {/* <div className="text-right text-xs text-muted-foreground">
          <p>Last fix</p>
          <p className="font-semibold text-foreground">{coordsCopy}</p>
        </div> */}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className={`h-14 text-lg font-semibold shadow-sm transition-all ${
            rideState === "on_trip" ? "bg-red-600 hover:bg-red-700 text-white" : 
            rideState === "booking" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          variant={rideState === "idle" ? "default" : "secondary"}
          onClick={handleMainAction}
        >
          {getMainButtonLabel()}
        </Button>

        {rideState === "booking" && (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
            onClick={handleCancelAction}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </div>

      {/* <p className="text-xs text-muted-foreground">
        Your live location is only used to suggest better zones and calculate your performance. It stays private to you.
      </p> */}

      {activeEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 pb-8 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-whitesmoke p-6 shadow-2xl"
          style={{
            background:'whitesmoke'
          }}
          >
            <p className="text-sm font-semibold text-muted-foreground">Confirm action</p>
            <h3 className="text-2xl font-semibold mt-1">{activeEvent.label}</h3>
            
            <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium capitalize">{platform}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium font-mono">{coordsCopy}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setActiveEvent(null)}>
                Back
              </Button>
              <Button 
                className="flex-1 h-12" 
                variant={activeEvent.type === "booking_cancelled" ? "destructive" : "default"}
                onClick={confirmEvent} 
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
