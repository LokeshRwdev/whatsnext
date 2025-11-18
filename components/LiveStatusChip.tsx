"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveStatusChipProps {
  trackingOn: boolean;
  lastPingAt: string | null;
  permissionStatus: string;
}

export function LiveStatusChip({ trackingOn, lastPingAt, permissionStatus }: LiveStatusChipProps) {
  const [description, setDescription] = useState("--");

  useEffect(() => {
    if (!lastPingAt) {
      setDescription("No GPS yet");
      return;
    }
    const update = () => {
      const seconds = Math.floor((Date.now() - Date.parse(lastPingAt)) / 1000);
      if (seconds < 5) setDescription("Just now");
      else setDescription(`${seconds}s ago`);
    };
    update();
    const id = setInterval(update, 5000);
    return () => clearInterval(id);
  }, [lastPingAt]);

  let label = "Paused";
  let color = "bg-muted text-foreground";

  if (trackingOn && lastPingAt && Date.now() - Date.parse(lastPingAt) < 15000) {
    label = "Live | Updating";
    color = "bg-emerald-600 text-white";
  } else if (!trackingOn) {
    label = "Paused";
  } else if (permissionStatus === "denied") {
    label = "No GPS";
    color = "bg-amber-500 text-white";
  } else {
    label = "Waiting";
    color = "bg-muted text-foreground";
  }

  const detailClass = color.includes("text-white") ? "text-white/80" : "text-muted-foreground";

  return (
    <div className={cn("inline-flex flex-col rounded-2xl px-4 py-2 text-xs font-medium", color)}>
      <span className="text-sm font-semibold leading-none">{label}</span>
      <span className={cn("text-[11px] leading-tight", detailClass)}>
        Last update: {description}
      </span>
    </div>
  );
}
