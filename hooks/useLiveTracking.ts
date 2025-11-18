"use client";

import { useCallback, useEffect, useRef } from "react";
import { postPing, RecommendationResponse } from "@/lib/api-client";
import { useTrackingStore } from "@/lib/tracking/store";
import { enqueue } from "@/lib/offline-queue";
import { toast } from "sonner";

const MIN_DISTANCE_DELTA = 30; // meters
const MIN_INTERVAL_MS = 5000;
const MAX_ACCURACY_METERS = 200;
const ACCURACY_IMPROVEMENT_FACTOR = 0.5;

type GeoPermissionDescriptor = { name: "geolocation" };

export function useLiveTracking() {
  const trackingOn = useTrackingStore((s) => s.trackingOn);
  const permissionStatus = useTrackingStore((s) => s.permissionStatus);
  const lastFix = useTrackingStore((s) => s.lastFix);
  const lastPingAt = useTrackingStore((s) => s.lastPingAt);
  const lastRecommendation = useTrackingStore((s) => s.lastRecommendation);
  const error = useTrackingStore((s) => s.error);
  const autoStartPending = useTrackingStore((s) => s.autoStartPending);
  const setTrackingOn = useTrackingStore((s) => s.setTrackingOn);
  const setPermissionStatus = useTrackingStore((s) => s.setPermissionStatus);
  const setLastFix = useTrackingStore((s) => s.setLastFix);
  const setLastPingAt = useTrackingStore((s) => s.setLastPingAt);
  const setRecommendation = useTrackingStore((s) => s.setRecommendation);
  const setError = useTrackingStore((s) => s.setError);
  const setAutoStartPending = useTrackingStore((s) => s.setAutoStartPending);
  const watchId = useRef<number | null>(null);
  const lastSentTimestamp = useRef<number>(0);
  const lastBroadcastPosition = useRef<GeolocationPosition | null>(null);

  const updatePermissionFromNavigator = useCallback(async () => {
    try {
      if (navigator.permissions?.query) {
        const result = await navigator.permissions.query(
          { name: "geolocation" } as PermissionDescriptor & GeoPermissionDescriptor
        );
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      } else {
        setPermissionStatus("unsupported");
      }
    } catch (err) {
      console.warn("permission query failed", err);
      setPermissionStatus("unsupported");
    }
  }, [setPermissionStatus]);

  useEffect(() => {
    updatePermissionFromNavigator();
  }, [updatePermissionFromNavigator]);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const handlePingSuccess = useCallback(
    (recommendation: RecommendationResponse | null, timestampIso: string) => {
      setLastPingAt(timestampIso);
      if (recommendation) {
        setRecommendation(recommendation);
      }
      setError(null);
    },
    [setLastPingAt, setRecommendation, setError]
  );

  const sendPing = useCallback(
    async (position: GeolocationPosition) => {
      const accuracy =
        typeof position.coords.accuracy === "number" ? position.coords.accuracy : null;
      if (!Number.isFinite(accuracy) || accuracy === null || accuracy > MAX_ACCURACY_METERS) {
        setError("GPS accuracy is weak (>200m). Move outdoors for a clear fix.");
        return;
      }

      const speedKmh =
        typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed)
          ? position.coords.speed * 3.6
          : null;

      setLastFix({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy,
        speed: speedKmh,
        timestamp: position.timestamp,
      });
      setError(null);

      const now = Date.now();
      const last = lastBroadcastPosition.current;
      let accuracyImproved = false;
      if (
        last &&
        typeof last.coords.accuracy === "number" &&
        Number.isFinite(last.coords.accuracy)
      ) {
        accuracyImproved = accuracy <= last.coords.accuracy * ACCURACY_IMPROVEMENT_FACTOR;
      }

      if (
        last &&
        distanceMeters(last.coords, position.coords) < MIN_DISTANCE_DELTA &&
        now - lastSentTimestamp.current < MIN_INTERVAL_MS &&
        !accuracyImproved
      ) {
        return;
      }

      lastBroadcastPosition.current = position;
      lastSentTimestamp.current = now;

      const payload = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        ts: new Date(position.timestamp).toISOString(),
        accuracy_m: accuracy,
        speed_kmh: speedKmh ?? undefined,
      };

      const { data, error } = await postPing(payload);
      if (error) {
        setError(error.message);
        await enqueue(payload);
        toast.error("Could not sync live location. We'll retry soon.");
        return;
      }

      handlePingSuccess(data?.recommendation ?? null, payload.ts ?? new Date().toISOString());
    },
    [setLastFix, handlePingSuccess, setError]
  );

  const requestPermission = useCallback(async () => {
    try {
      const { state } = await navigator.permissions.query(
        { name: "geolocation" } as PermissionDescriptor & GeoPermissionDescriptor
      );
      setPermissionStatus(state);
      if (state === "denied") {
        toast.error("Location permission denied. Enable it in browser settings.");
        return false;
      }
      if (state === "prompt") {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          });
        });
        setPermissionStatus("granted");
      }
      return true;
    } catch (error) {
      console.error("permission request failed", error);
      setPermissionStatus("unsupported");
      return false;
    }
  }, [setPermissionStatus]);

  const toggleTracking = useCallback(async () => {
    if (trackingOn) {
      stopWatch();
      setTrackingOn(false);
      return;
    }

    const granted = await requestPermission();
    if (!granted) {
      setError("Location permission required for live tracking");
      return;
    }

    setTrackingOn(true);
  }, [trackingOn, requestPermission, stopWatch, setTrackingOn, setError]);

  useEffect(() => {
    if (!trackingOn && autoStartPending) {
      void toggleTracking();
      setAutoStartPending(false);
    }
  }, [trackingOn, autoStartPending, toggleTracking, setAutoStartPending]);

  useEffect(() => {
    if (!trackingOn) {
      stopWatch();
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      toast.error("Geolocation is not available on this device.");
      setTrackingOn(false);
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => sendPing(pos),
      (err) => {
        console.error("watchPosition error", err);
        const friendly = describeGeoError(err);
        setError(friendly);
        if (err.code === err.PERMISSION_DENIED) {
          setTrackingOn(false);
          setPermissionStatus("denied");
          toast.error("Permission denied. Please re-enable location access.");
        } else {
          toast.error(friendly);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );

    return () => stopWatch();
  }, [trackingOn, sendPing, stopWatch, setError, setTrackingOn, setPermissionStatus]);

  useEffect(() => {
    function handleOnline() {
      setError(null);
    }
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [setError]);

  return {
    trackingOn,
    permissionStatus,
    lastFix,
    lastPingAt,
    lastRecommendation,
    error,
    toggleTracking,
  };
}

function distanceMeters(a: GeolocationCoordinates, b: GeolocationCoordinates) {
  const R = 6371e3;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const deltaLat = lat2 - lat1;
  const deltaLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const x =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function describeGeoError(err: GeolocationPositionError) {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Location permission denied. Enable it in your browser settings.";
    case err.POSITION_UNAVAILABLE:
      return "GPS signal unavailable. Move outdoors for a clear view of the sky.";
    case err.TIMEOUT:
      return "Timed out while waiting for GPS. Try again from an open area.";
    default:
      return err.message || "Unable to determine your location.";
  }
}
