"use client";

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeoBadgeProps {
  zoneName?: string;
  geohash?: string;
  className?: string;
}

export function GeoBadge({ zoneName, geohash, className }: GeoBadgeProps) {
  if (!zoneName && !geohash) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      <MapPin className="h-3 w-3" />
      <span>{zoneName || geohash}</span>
    </div>
  );
}
