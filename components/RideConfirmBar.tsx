"use client";

import { useState, useEffect } from "react";
import { enqueue, drain } from "@/lib/offline-queue";
import { sendRideEvent, type RideEventPayload } from "@/lib/ride-events";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type RideState = "seeking" | "booked" | "ontrip";

async function getCoords() {
  return new Promise<GeolocationPosition>((res, rej) =>
    navigator.geolocation.getCurrentPosition(res, rej, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    })
  )
    .then((p) => {
      const accuracy =
        typeof p.coords.accuracy === "number" ? p.coords.accuracy : null;
      if (!Number.isFinite(accuracy) || accuracy === null || accuracy > 200) {
        return { lat: null, lon: null };
      }
      return { lat: p.coords.latitude, lon: p.coords.longitude };
    })
    .catch(() => ({ lat: null, lon: null }));
}

export default function RideConfirmBar() {
  const [state, setState] = useState<RideState>("seeking");
  const [battery, setBattery] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    navigator.serviceWorker?.addEventListener("message", (e: any) => {
      if (e.data?.type === "SYNC_REQUEST") {
        // Drain offline queue using the same helper
        drain(async (event: any) => {
          const result = await sendRideEvent(event as RideEventPayload);
          return result.ok;
        });
      }
    });
  }, []);

  async function post(
    type:
      | "booking_received"
      | "ride_started"
      | "ride_completed"
      | "booking_cancelled"
  ) {
    setStatus("Locating...");
    const coords = await getCoords();
    if (coords.lat === null || coords.lon === null) {
      toast.warning("Weak GPS fix. Event will be saved without exact location.");
    }
    const payload: RideEventPayload = {
      event_type: type,
      occurred_at: new Date().toISOString(),
      battery_pct: battery ? Number(battery) : null,
      ...coords,
    };

    setStatus("Saving...");
    const result = await sendRideEvent(payload);

    if (!result.ok) {
      // Handle specific error cases
      if (result.error === "UNAUTHORIZED") {
        toast.error("Please log in to record ride events");
        router.push("/login");
        return;
      }

      // Offline or other error: queue + schedule background sync
      await enqueue(payload);
      const reg = await navigator.serviceWorker?.ready;
      // @ts-ignore - sync API not in default types
      await reg?.sync?.register("flush-ride-queue").catch(() => {});
      setStatus("Saved offline. Will sync when online.");
      toast.warning("Saved offline, will sync when online");
    } else {
      setStatus("Saved");
      toast.success("Ride event saved");
    }
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t">
      <div className="max-w-md mx-auto space-y-3">
        <input 
          className="w-full border rounded p-2" 
          placeholder="Battery % (optional)" 
          value={battery} 
          onChange={e => setBattery(e.target.value)} 
        />
        <div className="text-sm text-gray-600">
          {status || (state === "seeking" ? "Seeking rides..." : state === "booked" ? "Booking confirmed" : "On a trip")}
        </div>
        {state === "seeking" && (
          <button 
            className="w-full bg-emerald-600 text-white rounded p-4 text-lg" 
            onClick={async () => { 
              await post("booking_received"); 
              setState("booked"); 
            }}
          >
            Got a ride
          </button>
        )}
        {state === "booked" && (
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="bg-emerald-600 text-white rounded p-4" 
              onClick={async () => { 
                await post("ride_started"); 
                setState("ontrip"); 
              }}
            >
              Start trip
            </button>
            <button 
              className="border rounded p-4" 
              onClick={async () => { 
                await post("booking_cancelled"); 
                setState("seeking"); 
              }}
            >
              Cancel
            </button>
          </div>
        )}
        {state === "ontrip" && (
          <button 
            className="w-full bg-emerald-600 text-white rounded p-4 text-lg" 
            onClick={async () => { 
              await post("ride_completed"); 
              setState("seeking"); 
            }}
          >
            End trip
          </button>
        )}
      </div>
    </div>
  );
}
