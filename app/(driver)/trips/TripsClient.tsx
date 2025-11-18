"use client";

import { useState, type ChangeEvent } from "react";
import { format, startOfDay } from "date-fns";
import { DriverShell } from "@/components/layout/DriverShell";
import { useTripsQuery } from "@/lib/hooks/useTripsQuery";
import { useOpsDaily } from "@/lib/hooks/useOpsDaily";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export default function TripsClient() {
  const [from, setFrom] = useState(startOfDay(new Date()));
  const [to, setTo] = useState(new Date());
  const [platform, setPlatform] = useState<"all" | "ola" | "uber">("all");
  const { trips, stats, loading, error, refresh } = useTripsQuery({ from, to, platform });
  const dayFilter = format(from, "yyyy-MM-dd");
  const singleDay = dayFilter === format(to, "yyyy-MM-dd");
  const { data: opsDaily } = useOpsDaily(dayFilter);

  const updateDate = (setter: (date: Date) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(new Date(`${event.target.value}T00:00:00`));
  };

  return (
    <DriverShell title="Trips & Earnings" subtitle="Track performance and demand">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-5">
          <StatsCard label="Total trips" value={stats.totalTrips.toString()} />
          <StatsCard label="Earnings" value={`?${stats.totalEarnings.toFixed(0)}`} />
          <StatsCard
            label="? / hour"
            value={stats.totalHours > 0 ? `?${(stats.totalEarnings / stats.totalHours).toFixed(0)}` : "--"}
          />
          <StatsCard label="Deadhead km" value={`${stats.deadheadKm.toFixed(1)} km`} />
          <StatsCard
            label="Idle minutes"
            value={singleDay ? opsDaily?.idle_minutes?.toString() ?? "--" : "Select 1 day"}
          />
        </div>

        <div className="rounded-2xl border p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <label className="text-sm">
              From
              <input
                type="date"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={format(from, "yyyy-MM-dd")}
                onChange={updateDate(setFrom)}
              />
            </label>
            <label className="text-sm">
              To
              <input
                type="date"
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={format(to, "yyyy-MM-dd")}
                onChange={updateDate(setTo)}
              />
            </label>
            <div className="text-sm">
              Platform
              <div className="mt-1 inline-flex gap-2 rounded-full bg-muted p-1">
                {["all", "ola", "uber"].map((item) => (
                  <button
                    key={item}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                      platform === item ? "bg-white text-foreground shadow" : "text-muted-foreground"
                    }`}
                    onClick={() => setPlatform(item as typeof platform)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={refresh} disabled={loading} className="w-full" variant="secondary">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading trips.</p>}
          {!loading && trips.length === 0 && (
            <p className="text-sm text-muted-foreground">No trips in this range.</p>
          )}
          {trips.map((trip) => (
            <Card key={trip.id} className="space-y-2 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold capitalize">{trip.platform}</span>
                <span className="text-muted-foreground">
                  {trip.pickup_at ? format(new Date(trip.pickup_at), "MMM d, h:mm a") : "--"} {"->"}{" "}
                  {trip.drop_at ? format(new Date(trip.drop_at), "h:mm a") : "--"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Pickup</p>
                  <p className="font-medium">{trip.pickup_zone_name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Drop</p>
                  <p className="font-medium">{trip.drop_zone_name || "Unknown"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{trip.distance_km ? `${trip.distance_km.toFixed(1)} km` : "--"}</span>
                <span className="font-semibold">?{((trip.fare_inr ?? 0) + (trip.tip_inr ?? 0)).toFixed(0)}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DriverShell>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
