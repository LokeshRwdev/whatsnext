/**
 * Server-side geospatial utilities for Patna EV Co-Pilot
 * All geographic calculations for recommendations and distance estimation
 */

/**
 * Geometry point returned by Supabase/PostGIS. Coordinates array is [lon, lat].
 * See https://supabase.com/docs/guides/database/extensions/postgis#geography-geometric-objects
 */
export type GeoJsonPoint = {
  type: "Point";
  coordinates: [number, number];
  crs?: { type: string; properties: Record<string, any> };
};

/**
 * Convert GeoJSON point to lat/lon pair.
 */
export function latLonFromPoint(
  point: GeoJsonPoint | null | undefined
): { lat: number | null; lon: number | null } {
  if (!point || !Array.isArray(point.coordinates)) {
    return { lat: null, lon: null };
  }
  const [lon, lat] = point.coordinates ?? [];
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { lat: null, lon: null };
  }
  return { lat, lon };
}

/**
 * Build a GeoJSON Point payload for inserting/updating geography columns.
 */
export function pointFromLatLon(lat: number, lon: number): GeoJsonPoint {
  return {
    type: "Point",
    coordinates: [lon, lat],
  };
}

/**
 * Calculate Haversine distance between two points in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate distance in kilometers
 */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return haversineDistance(lat1, lon1, lat2, lon2) / 1000;
}

/**
 * Estimate travel time in minutes based on distance and average speed
 * Applies Patna-specific road biases:
 * - Urban areas: ~15 km/h average (heavy traffic, narrow roads)
 * - Highway corridors: ~30 km/h average
 * - Short distances (<2km): add 3 min penalty for navigation/turns
 */
export function estimateETA(
  distanceMeters: number,
  currentSpeedKmh?: number | null
): number {
  const distanceKm = distanceMeters / 1000;

  // Use current speed if available and reasonable (5-60 km/h)
  let avgSpeed = 15; // Default urban speed
  if (currentSpeedKmh && currentSpeedKmh >= 5 && currentSpeedKmh <= 60) {
    avgSpeed = currentSpeedKmh;
  } else if (distanceKm > 5) {
    // Longer distances likely use better roads
    avgSpeed = 25;
  }

  let etaMinutes = (distanceKm / avgSpeed) * 60;

  // Add navigation penalty for short trips
  if (distanceKm < 2) {
    etaMinutes += 3;
  }

  return Math.ceil(etaMinutes);
}

/**
 * Validate latitude is within valid range
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validate longitude is within valid range
 */
export function isValidLongitude(lon: number): boolean {
  return lon >= -180 && lon <= 180;
}

/**
 * Validate coordinates are within Patna's approximate bounds
 * Patna roughly: 25.3°-25.8°N, 84.9°-85.4°E
 * Using generous bounds to allow some flexibility
 */
export function isWithinPatnaBounds(lat: number, lon: number): boolean {
  return lat >= 25.0 && lat <= 26.0 && lon >= 84.5 && lon <= 85.8;
}

/**
 * Get current 30-minute time bucket
 * Returns format: "HH:00" or "HH:30"
 */
export function getCurrentBucket30m(): string {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = now.getMinutes() < 30 ? "00" : "30";
  return `${hour}:${minutes}`;
}

/**
 * Get hour of day (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Get day of week (0=Sunday, 6=Saturday)
 */
export function getCurrentDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Format coordinates for logging (truncated to 4 decimal places)
 */
export function formatCoords(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}
