"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BatteryChip } from "@/components/BatteryChip";
import { useAppStore } from "@/lib/store";
import { useTodayStats } from "@/lib/hooks/useTodayStats";
import { LogoutButton } from "@/components/auth/LogoutButton";

interface NavBarProps {
  userEmail?: string | null;
  displayName?: string | null;
}

export function NavBar({ userEmail, displayName }: NavBarProps) {
  const battery = useAppStore((state) => state.battery);
  const [now, setNow] = useState(new Date());
  const { stats } = useTodayStats();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateCopy = format(now, "EEE, MMM d");
  const timeCopy = format(now, "h:mm a");
  const identity = displayName?.trim() || userEmail || null;
  const rupeeFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }),
    []
  );
  const statHighlights = [
    { label: "Earned today", value: rupeeFormatter.format(stats.totalEarnings) },
    { label: "Trips", value: stats.totalTrips.toString() },
    { label: "Active hrs", value: `${stats.totalHours.toFixed(1)}h` },
    { label: "Idle", value: `${stats.idleMinutes}m` },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-bg/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-bg/60">
      <div className="container px-2 py-3">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col flex-wrap items-start justify-between gap-4">
            <Link href="/" className="flex flex-col space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {dateCopy}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-semibold leading-tight">Driver Co-Pilot</span>
                <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
                  Driver console
                </span>
              <ThemeToggle />

              </div>
              <p className="text-sm text-muted-foreground">Smart assistance for O in Patna.</p>
            </Link>
            {/* <div className="flex flex-1 flex-wrap items-center  gap-4 text-sm">
              {statHighlights.map((item) => (
                <div
                  key={item.label}
                  className="min-w-[4rem] rounded-2xl border border-border/60 bg-card/80 px-2 py-2 text-left shadow-sm"
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="text-base font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-3">
            {/* <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="text-base">{timeCopy}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Live clock</span>
              </div>
              <span className="hidden h-5 w-px bg-border/70 sm:block" />
              <p>Today&apos;s cockpit overview</p>
              {identity && (
                <>
                  <span className="hidden h-5 w-px bg-border/70 sm:block" />
                  <p>
                    Logged in as <span className="font-semibold text-foreground">{identity}</span>
                  </p>
                </>
              )}
            </div> */}
            <div className="flex flex-wrap items-center gap-3">
              {/* <BatteryChip percentage={battery} /> */}
              <span className="hidden h-8 w-px bg-border/70 sm:block" />
              {/* <LogoutButton variant="outline" size="sm" className="rounded-full px-4" /> */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
