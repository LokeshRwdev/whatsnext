"use client";

import { cn } from "@/lib/utils";

interface GpsAccuracyBadgeProps {
  accuracy?: number | null;
  trackingOn: boolean;
}

export function GpsAccuracyBadge({ accuracy, trackingOn }: GpsAccuracyBadgeProps) {
  let label = trackingOn ? "GPS: waiting for fix" : "GPS: paused";
  let tone = "bg-muted text-muted-foreground";

  if (typeof accuracy === "number" && Number.isFinite(accuracy)) {
    const rounded = Math.max(0, Math.round(accuracy));
    if (rounded <= 30) {
      label = `GPS: ${rounded}m accuracy`;
      tone = "bg-emerald-100 text-emerald-900";
    } else if (rounded <= 100) {
      label = `GPS: ${rounded}m (ok)`;
      tone = "bg-amber-100 text-amber-900";
    } else {
      label = `GPS: ${rounded}m (weak) - move outdoors`;
      tone = "bg-rose-100 text-rose-900";
    }
  } else if (trackingOn) {
    tone = "bg-muted text-muted-foreground";
  }

  return (
    <div className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tone)}>
      {label}
    </div>
  );
}
