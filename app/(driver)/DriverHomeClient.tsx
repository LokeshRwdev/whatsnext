"use client";

import { DriverShell } from "@/components/layout/DriverShell";
import { TrackingToggle } from "@/components/TrackingToggle";
import { LiveStatusChip } from "@/components/LiveStatusChip";
import { NextZonesPanel } from "@/components/NextZonesPanel";
import { TrafficPreviewMap } from "@/components/TrafficPreviewMap";
import { RideControls } from "@/components/RideControls";
import { GpsAccuracyBadge } from "@/components/GpsAccuracyBadge";
import { useLiveTracking } from "@/hooks/useLiveTracking";
import { useDriverProfile } from "@/lib/hooks/useDriverProfile";
import { useTodayStats } from "@/lib/hooks/useTodayStats";

export default function DriverHomeClient() {
  const tracking = useLiveTracking();
  const profile = useDriverProfile();
  const { stats } = useTodayStats();

  const greeting = profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Hi driver";
  const subtitle = `Today | ${stats.totalTrips} trips | ?${stats.totalEarnings.toFixed(0)}`;

  const gpsReady = tracking.hasLocation;
  const waitingForGps = tracking.isFetchingLocation;

  return (
    <DriverShell title={greeting} subtitle={subtitle}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* <TrackingToggle
            trackingOn={tracking.trackingOn}
            permissionStatus={tracking.permissionStatus}
            toggleTracking={tracking.toggleTracking}
            error={tracking.error}
          /> */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {/* <LiveStatusChip
              trackingOn={tracking.trackingOn}
              lastPingAt={tracking.lastPingAt}
              permissionStatus={tracking.permissionStatus}
            /> */}
            <GpsAccuracyBadge
              trackingOn={tracking.trackingOn}
              accuracy={tracking.lastFix?.accuracy ?? null}
            />
            {waitingForGps && (
              <div className="text-xs text-amber-600">
                Acquiring GPS fix...
              </div>
            )}
          </div>
        </div>

        <NextZonesPanel
          trackingOn={tracking.trackingOn}
          hasLocation={tracking.hasLocation}
          isFetchingLocation={tracking.isFetchingLocation}
          currentLoc={tracking.currentLoc}
          seedRecommendation={tracking.lastRecommendation}
          allowLowAccuracy={tracking.allowLowAccuracy}
          onAllowLowAccuracy={() => tracking.setAllowLowAccuracy(true)}
        />

        {/* <TrafficPreviewMap
          currentLocation={tracking.lastFix}
          recommendedZones={tracking.lastRecommendation?.top ?? null}
        /> */}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Ride actions</h2>
          <RideControls lastFix={tracking.lastFix} />
        </section>
      </div>
    </DriverShell>
  );
}
