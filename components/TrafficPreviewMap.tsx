"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import type { RecommendationZone } from "@/lib/api-client";
import type { TrackingFix } from "@/lib/tracking/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: any;
  }
}

interface TrafficPreviewMapProps {
  currentLocation: TrackingFix | null;
  recommendedZones?: RecommendationZone[] | null;
}

const DEFAULT_CENTER = { lat: 25.617, lon: 85.141 };
const MAPS_BROWSER_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAX_ACCURACY_METERS = 200;

export function TrafficPreviewMap({
  currentLocation,
  recommendedZones,
}: TrafficPreviewMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const markersRef = useRef<any[]>([]);
  const locationWatchRef = useRef<number | null>(null);
  const zones = useMemo(
    () => (recommendedZones ?? []).filter((zone) => typeof zone.lat === "number" && typeof zone.lon === "number"),
    [recommendedZones]
  );

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsRequestingLocation(true);
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
    }

    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const accuracy =
          typeof position.coords.accuracy === "number" ? position.coords.accuracy : null;
        if (!Number.isFinite(accuracy) || accuracy === null || accuracy > MAX_ACCURACY_METERS) {
          setLocationError("Waiting for a precise GPS fix (move outdoors if possible).");
          setIsRequestingLocation(false);
          return;
        }
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy,
        });
        setLocationError(null);
        setIsRequestingLocation(false);
      },
      (error) => {
        setIsRequestingLocation(false);
        setLocationError(describeGeoError(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15_000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
    return () => {
      if (locationWatchRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [requestLocation]);

  useEffect(() => {
    if (!MAPS_BROWSER_KEY || !scriptLoaded || map || !mapRef.current) return;
    const google = window.google;
    if (!google?.maps) return;
    
    const effectiveLocation = currentLocation || userLocation;
    const initialCenter = effectiveLocation
      ? { lat: effectiveLocation.lat, lng: effectiveLocation.lon }
      : { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lon };
    
    const instance = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
      disableDefaultUI: true,
    });
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(instance);
    setMap(instance);
    return () => {
      trafficLayer.setMap(null);
    };
  }, [scriptLoaded, map, currentLocation, userLocation]);

  useEffect(() => {
    if (!map) return;
    const google = window.google;
    if (!google?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasBounds = false;

    const effectiveLocation = currentLocation || userLocation;
    if (effectiveLocation) {
      const marker = new google.maps.Marker({
        map,
        position: { lat: effectiveLocation.lat, lng: effectiveLocation.lon },
        title: "You",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition()!);
      hasBounds = true;
      map.panTo(marker.getPosition()!);
    }

    zones.forEach((zone, idx) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: zone.lat, lng: zone.lon },
        label: `${idx + 1}`,
        title: zone.zone_name,
      });
      markersRef.current.push(marker);
      bounds.extend(marker.getPosition()!);
      hasBounds = true;
    });

    if (hasBounds) {
      map.fitBounds(bounds, 48);
    }
  }, [map, zones, currentLocation, userLocation]);

  if (!MAPS_BROWSER_KEY) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Live map preview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to load the in-app map preview.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">Live map preview</CardTitle>
        <p className="text-xs text-muted-foreground">
          Browser geolocation + Google Maps traffic overlay (visual only)
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {locationError && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {locationError}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={isRequestingLocation}
          >
            {isRequestingLocation ? "Requesting location..." : "Use my current location"}
          </Button>
        </div>
        <div className="h-64 w-full overflow-hidden rounded-2xl border" ref={mapRef} />
        {zones.length > 0 ? (
          <div className="text-xs text-muted-foreground">
            {zones.slice(0, 3).map((zone, idx) => (
              <div key={zone.zone_id}>
                #{idx + 1} {zone.zone_name}: {zone.eta_min.toFixed(1)} min,{" "}
                {zone.distance_km.toFixed(1)} km
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Start tracking to see nearby recommended zones on the map.
          </p>
        )}
      </CardContent>
      <Script
        id="google-maps-js"
        src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_BROWSER_KEY}&libraries=visualization`}
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />
    </Card>
  );
}

function describeGeoError(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission denied. Please enable location access in your browser settings.";
    case error.POSITION_UNAVAILABLE:
      return "GPS signal unavailable. Move outdoors for a clearer sky view.";
    case error.TIMEOUT:
      return "Timed out while fetching your location. Try again from an open area.";
    default:
      return "Unable to retrieve your location";
  }
}
