"use client";

import { create } from "zustand";
import type { RecommendationResponse } from "@/lib/api-client";

export type PermissionStateMaybe = PermissionState | "prompt" | "unsupported";

export type TrackingFix = {
  lat: number;
  lon: number;
  accuracy?: number | null;
  speed?: number | null;
  timestamp: number;
};

interface TrackingState {
  trackingOn: boolean;
  permissionStatus: PermissionStateMaybe;
  lastFix: TrackingFix | null;
  lastPingAt: string | null;
  lastRecommendation: RecommendationResponse | null;
  error: string | null;
  isDriving: boolean;
  autoStartPending: boolean;
  allowLowAccuracy: boolean;
  setTrackingOn: (next: boolean) => void;
  setPermissionStatus: (status: PermissionStateMaybe) => void;
  setLastFix: (fix: TrackingFix | null) => void;
  setLastPingAt: (iso: string | null) => void;
  setRecommendation: (rec: RecommendationResponse | null) => void;
  setError: (message: string | null) => void;
  setIsDriving: (next: boolean) => void;
  setAutoStartPending: (pending: boolean) => void;
  setAllowLowAccuracy: (next: boolean) => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  trackingOn: false,
  permissionStatus: "prompt",
  lastFix: null,
  lastPingAt: null,
  lastRecommendation: null,
  error: null,
  isDriving: false,
  autoStartPending: true,
  allowLowAccuracy: false,
  setTrackingOn: (trackingOn) => set({ trackingOn }),
  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setLastFix: (lastFix) => set({ lastFix }),
  setLastPingAt: (lastPingAt) => set({ lastPingAt }),
  setRecommendation: (lastRecommendation) => set({ lastRecommendation }),
  setError: (error) => set({ error }),
  setIsDriving: (isDriving) =>
    set(() => ({
      isDriving,
      autoStartPending: isDriving ? false : true,
    })),
  setAutoStartPending: (autoStartPending) => set({ autoStartPending }),
  setAllowLowAccuracy: (allowLowAccuracy) => set({ allowLowAccuracy }),
}));
