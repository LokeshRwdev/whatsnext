"use client";

import { PermissionStateMaybe } from "@/lib/tracking/store";
import { cn } from "@/lib/utils";

interface TrackingToggleProps {
  trackingOn: boolean;
  permissionStatus: PermissionStateMaybe;
  toggleTracking: () => void;
  error?: string | null;
}

export function TrackingToggle({ trackingOn, permissionStatus, toggleTracking, error }: TrackingToggleProps) {
  const statusCopy = buildStatus(permissionStatus, error);

  return (
    <button
      type="button"
      onClick={toggleTracking}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition hover:border-primary",
        trackingOn ? "bg-emerald-600 text-white" : "bg-muted text-foreground"
      )}
      aria-pressed={trackingOn}
    >
      <div className="relative inline-flex h-5 w-10 items-center rounded-full bg-white/30 p-0.5">
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transition",
            trackingOn ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold leading-tight">Live Suggestions</p>
        <p className="text-xs text-muted-foreground/90">
          {trackingOn ? "Tracking enabled" : "Tap to start"} | {statusCopy}
        </p>
      </div>
    </button>
  );
}

function buildStatus(permission: PermissionStateMaybe, error?: string | null) {
  if (error) return error;
  switch (permission) {
    case "granted":
      return "Foreground only";
    case "denied":
      return "Permission denied";
    case "prompt":
      return "Requires GPS access";
    case "unsupported":
      return "GPS unsupported";
    default:
      return permission || "";
  }
}
