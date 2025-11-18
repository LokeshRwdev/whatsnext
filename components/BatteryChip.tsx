"use client";

import { Battery, BatteryLow, BatteryMedium } from "lucide-react";
import { cn } from "@/lib/utils";

interface BatteryChipProps {
  percentage: number | null;
  className?: string;
}

export function BatteryChip({ percentage, className }: BatteryChipProps) {
  if (percentage === null) return null;

  const getColor = () => {
    if (percentage > 60) return "text-green-600 dark:text-green-400";
    if (percentage >= 30) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getIcon = () => {
    if (percentage > 60) return Battery;
    if (percentage >= 30) return BatteryMedium;
    return BatteryLow;
  };

  const Icon = getIcon();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
        "bg-muted/50",
        getColor(),
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{percentage}%</span>
    </div>
  );
}
