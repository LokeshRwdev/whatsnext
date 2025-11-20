module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/lib/api-respond.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HttpError",
    ()=>HttpError,
    "bad",
    ()=>bad,
    "handleRouteError",
    ()=>handleRouteError,
    "ok",
    ()=>ok
]);
class HttpError extends Error {
    code;
    status;
    details;
    constructor(status, code, message, details){
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
function ok(data, status = 200) {
    return Response.json(data, {
        status
    });
}
function bad(message, details, status = 400, code) {
    const resolvedCode = code ?? (status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST");
    return Response.json({
        error: {
            code: resolvedCode,
            message,
            details
        }
    }, {
        status
    });
}
function handleRouteError(err) {
    if (err instanceof HttpError) {
        return bad(err.message, err.details, err.status, err.code);
    }
    if (err instanceof Error) {
        return bad(err.message, null, 500, "INTERNAL_ERROR");
    }
    return bad("Internal error", null, 500, "INTERNAL_ERROR");
}
}),
"[project]/lib/server/geo-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server-side geospatial utilities for Patna EV Co-Pilot
 * All geographic calculations for recommendations and distance estimation
 */ /**
 * Geometry point returned by Supabase/PostGIS. Coordinates array is [lon, lat].
 * See https://supabase.com/docs/guides/database/extensions/postgis#geography-geometric-objects
 */ __turbopack_context__.s([
    "distanceKm",
    ()=>distanceKm,
    "estimateETA",
    ()=>estimateETA,
    "formatCoords",
    ()=>formatCoords,
    "getCurrentBucket30m",
    ()=>getCurrentBucket30m,
    "getCurrentDayOfWeek",
    ()=>getCurrentDayOfWeek,
    "getCurrentHour",
    ()=>getCurrentHour,
    "haversineDistance",
    ()=>haversineDistance,
    "isValidLatitude",
    ()=>isValidLatitude,
    "isValidLongitude",
    ()=>isValidLongitude,
    "isWithinPatnaBounds",
    ()=>isWithinPatnaBounds,
    "latLonFromPoint",
    ()=>latLonFromPoint,
    "pointFromLatLon",
    ()=>pointFromLatLon
]);
function latLonFromPoint(point) {
    if (!point || !Array.isArray(point.coordinates)) {
        return {
            lat: null,
            lon: null
        };
    }
    const [lon, lat] = point.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return {
            lat: null,
            lon: null
        };
    }
    return {
        lat,
        lon
    };
}
function pointFromLatLon(lat, lon) {
    return {
        type: "Point",
        coordinates: [
            lon,
            lat
        ]
    };
}
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}
function distanceKm(lat1, lon1, lat2, lon2) {
    return haversineDistance(lat1, lon1, lat2, lon2) / 1000;
}
function estimateETA(distanceMeters, currentSpeedKmh) {
    const distanceKm = distanceMeters / 1000;
    // Use current speed if available and reasonable (5-60 km/h)
    let avgSpeed = 15; // Default urban speed
    if (currentSpeedKmh && currentSpeedKmh >= 5 && currentSpeedKmh <= 60) {
        avgSpeed = currentSpeedKmh;
    } else if (distanceKm > 5) {
        // Longer distances likely use better roads
        avgSpeed = 25;
    }
    let etaMinutes = distanceKm / avgSpeed * 60;
    // Add navigation penalty for short trips
    if (distanceKm < 2) {
        etaMinutes += 3;
    }
    return Math.ceil(etaMinutes);
}
function isValidLatitude(lat) {
    return lat >= -90 && lat <= 90;
}
function isValidLongitude(lon) {
    return lon >= -180 && lon <= 180;
}
function isWithinPatnaBounds(lat, lon) {
    return lat >= 25.0 && lat <= 26.0 && lon >= 84.5 && lon <= 85.8;
}
function getCurrentBucket30m() {
    const now = new Date();
    const hour = String(now.getHours()).padStart(2, "0");
    const minutes = now.getMinutes() < 30 ? "00" : "30";
    return `${hour}:${minutes}`;
}
function getCurrentHour() {
    return new Date().getHours();
}
function getCurrentDayOfWeek() {
    return new Date().getDay();
}
function formatCoords(lat, lon) {
    return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}
}),
"[project]/lib/server/time-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Time-bucketing helpers shared across server modules.
 * Buckets are 30-minute windows aligned to the top :00 or :30 minute.
 */ __turbopack_context__.s([
    "bucketLabel",
    ()=>bucketLabel,
    "isWithinSameBucket",
    ()=>isWithinSameBucket,
    "truncateTo30MinBucket",
    ()=>truncateTo30MinBucket
]);
function truncateTo30MinBucket(date) {
    const bucket = new Date(date);
    bucket.setSeconds(0, 0);
    const minutes = bucket.getMinutes();
    bucket.setMinutes(minutes < 30 ? 0 : 30);
    return bucket;
}
function bucketLabel(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = date.getMinutes() === 0 ? "00" : "30";
    return `${hours}:${minutes}`;
}
function isWithinSameBucket(candidate, bucketStart) {
    const candidateDate = typeof candidate === "string" ? new Date(candidate) : candidate;
    return truncateTo30MinBucket(candidateDate).getTime() === bucketStart.getTime();
}
}),
"[project]/lib/server/googleMaps.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTrafficMatrix",
    ()=>getTrafficMatrix
]);
const DISTANCE_MATRIX_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";
const MAX_DESTINATIONS_PER_REQUEST = 25;
const CACHE_COORD_PRECISION = 3; // ~100m grid
const CACHE_TTL_MS = 60_000;
const responseCache = new Map();
async function getTrafficMatrix(params) {
    if (params.destinations.length === 0) {
        return [];
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GOOGLE_MAPS_API_KEY environment variable");
    }
    const departure = params.departureTime ?? new Date();
    const departureEpoch = Math.floor(departure.getTime() / 1000);
    const cacheKey = buildCacheKey(params.origin, params.destinations, departureEpoch);
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }
    const entries = [];
    const destinationChunks = chunkDestinations(params.destinations, MAX_DESTINATIONS_PER_REQUEST);
    for (const chunk of destinationChunks){
        const url = new URL(DISTANCE_MATRIX_URL);
        url.searchParams.set("origins", formatLatLon(params.origin.lat, params.origin.lon));
        url.searchParams.set("destinations", chunk.map((dest)=>formatLatLon(dest.lat, dest.lon)).join("|"));
        url.searchParams.set("departure_time", departureEpoch.toString());
        url.searchParams.set("traffic_model", "best_guess");
        url.searchParams.set("units", "metric");
        url.searchParams.set("key", apiKey);
        const res = await fetch(url.toString(), {
            method: "GET",
            cache: "no-store"
        });
        if (!res.ok) {
            throw new Error(`Google Maps Distance Matrix HTTP ${res.status}`);
        }
        const payload = await res.json();
        if (payload.status !== "OK") {
            throw new Error(`Google Maps Distance Matrix error: ${payload.status}${payload.error_message ? ` (${payload.error_message})` : ""}`);
        }
        const row = payload.rows?.[0];
        if (!row || !Array.isArray(row.elements)) {
            throw new Error("Google Maps Distance Matrix returned no rows");
        }
        row.elements.forEach((element, idx)=>{
            const dest = chunk[idx];
            entries.push({
                zoneId: dest.zoneId,
                distanceMeters: sanitizeNumber(element.distance?.value),
                durationSeconds: sanitizeNumber(element.duration?.value),
                durationInTrafficSeconds: sanitizeNumber(element.duration_in_traffic?.value),
                status: element.status ?? "UNKNOWN"
            });
        });
    }
    responseCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        data: entries
    });
    return entries;
}
function sanitizeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function formatLatLon(lat, lon) {
    return `${lat},${lon}`;
}
function chunkDestinations(input, size) {
    const chunks = [];
    for(let i = 0; i < input.length; i += size){
        chunks.push(input.slice(i, i + size));
    }
    return chunks;
}
function buildCacheKey(origin, destinations, departureEpoch) {
    const originKey = `${origin.lat.toFixed(CACHE_COORD_PRECISION)},${origin.lon.toFixed(CACHE_COORD_PRECISION)}`;
    const destKey = destinations.map((dest)=>`${dest.zoneId}:${dest.lat.toFixed(CACHE_COORD_PRECISION)},${dest.lon.toFixed(CACHE_COORD_PRECISION)}`).sort().join("|");
    const timeBucket = Math.floor(departureEpoch / 60); // 1-minute buckets
    return `${originKey}|${destKey}|${timeBucket}`;
}
}),
"[project]/lib/server/recommendation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeNextZonesForDriver",
    ()=>computeNextZonesForDriver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/time-utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$googleMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/googleMaps.ts [app-route] (ecmascript)");
;
;
;
const DEFAULT_MAX_DISTANCE_KM = 12;
const SUCCESS_LOOKBACK_DAYS = 14;
const DEFAULT_FARE_INR = 180;
const SCORE_WEIGHTS = {
    success: 0.4,
    fare: 0.3,
    eta: 0.2,
    traffic: 0.1
};
const TRAFFIC_REUSE_DISTANCE_METERS = 200;
const TRAFFIC_REUSE_INTERVAL_MS = 45_000;
const driverTrafficCache = new Map();
async function computeNextZonesForDriver(params) {
    const { supabase, driverId, currentLoc, snappedZoneId = null, k = 3, context, now, currentSpeedKmh } = params;
    const computedAt = typeof now === "string" ? new Date(now) : now ? now : new Date();
    const bucketStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["truncateTo30MinBucket"])(computedAt);
    const bucketIso = bucketStart.toISOString();
    const bucketLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bucketLabel"])(bucketStart);
    const normalizedContext = normalizeContext(context);
    const candidateFetch = await fetchCandidateZones(supabase, currentLoc);
    const candidates = candidateFetch.candidates;
    console.log("[recommendations] candidate fetch result", {
        driverId,
        currentLoc,
        totalZones: candidateFetch.totalZones,
        zonesWithCoordinates: candidateFetch.zonesWithCoordinates,
        candidateCount: candidates.length
    });
    if (candidates.length === 0) {
        const reason = candidateFetch.totalZones === 0 ? "no_zones_in_db" : candidateFetch.zonesWithCoordinates === 0 ? "no_zones_with_coords" : "zones_too_far";
        console.warn("[recommendations] No candidates available", {
            driverId,
            reason,
            totalZones: candidateFetch.totalZones,
            zonesWithCoordinates: candidateFetch.zonesWithCoordinates,
            currentLoc
        });
        return {
            computed_at: computedAt.toISOString(),
            context: {
                ...normalizedContext,
                driver_id: driverId,
                snapped_zone: snappedZoneId,
                bucket_start: bucketIso,
                bucket_label: bucketLabel,
                traffic_source: "fallback",
                reason
            },
            top: [],
            traffic_source: "fallback"
        };
    }
    const zoneIds = candidates.map((c)=>c.zone.id);
    const [successStats, fareStats, trafficSnapshot] = await Promise.all([
        loadTrainingSuccess(supabase, zoneIds, bucketStart, driverId),
        loadExpectedFare(supabase, zoneIds, bucketStart, driverId),
        resolveTrafficSnapshot({
            driverId,
            origin: currentLoc,
            candidates,
            departure: computedAt,
            currentSpeedKmh: currentSpeedKmh ?? null
        })
    ]);
    const fallbackFare = resolveFallbackFare(fareStats);
    let trafficSpeedSum = 0;
    let trafficSpeedSamples = 0;
    const zoneWithStats = candidates.map((candidate)=>{
        const zoneId = candidate.zone.id;
        const successEntry = successStats.get(zoneId);
        const successProb = successEntry ? successEntry.prob : 0.35;
        const fareEntry = fareStats.get(zoneId);
        const expectedFare = fareEntry && fareEntry.count > 0 ? fareEntry.sum / fareEntry.count : fallbackFare;
        const trafficEntry = trafficSnapshot.entries.get(zoneId);
        const fallbackDistanceMeters = candidate.distanceKm * 1000;
        const distanceMeters = trafficEntry?.distanceMeters && trafficEntry.distanceMeters > 0 ? trafficEntry.distanceMeters : fallbackDistanceMeters;
        const distanceKm = Number((distanceMeters / 1000).toFixed(2));
        const etaSeconds = trafficEntry?.durationInTrafficSeconds && trafficEntry.durationInTrafficSeconds > 0 ? trafficEntry.durationInTrafficSeconds : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateETA"])(fallbackDistanceMeters, currentSpeedKmh) * 60;
        const etaMin = Number((etaSeconds / 60).toFixed(1));
        const trafficSpeedIdx = typeof trafficEntry?.trafficSpeedIdx === "number" ? trafficEntry.trafficSpeedIdx : null;
        if (typeof trafficSpeedIdx === "number") {
            trafficSpeedSum += trafficSpeedIdx;
            trafficSpeedSamples += 1;
        }
        return {
            zoneId,
            zoneName: candidate.zone.name,
            lat: candidate.zone.lat,
            lon: candidate.zone.lon,
            distanceKm,
            etaMin,
            successProb,
            expectedFare,
            trafficSpeedIdx
        };
    });
    const maxFare = zoneWithStats.reduce((max, zone)=>Math.max(max, zone.expectedFare), fallbackFare);
    const scored = zoneWithStats.map((stat)=>{
        const normalizedFare = maxFare > 0 ? Number((stat.expectedFare / maxFare).toFixed(3)) : 0;
        const etaPenalty = Math.min(stat.etaMin / 30, 1);
        const trafficPenalty = computeZoneTrafficPenalty(stat.trafficSpeedIdx, normalizedContext);
        const rawScore = SCORE_WEIGHTS.success * stat.successProb + SCORE_WEIGHTS.fare * normalizedFare - SCORE_WEIGHTS.eta * etaPenalty - SCORE_WEIGHTS.traffic * trafficPenalty;
        const score = clamp(rawScore, 0, 1);
        const reason = buildReason(stat, normalizedFare, stat.trafficSpeedIdx, normalizedContext);
        return {
            zone_id: stat.zoneId,
            zone_name: stat.zoneName,
            lat: stat.lat,
            lon: stat.lon,
            distance_km: stat.distanceKm,
            eta_min: stat.etaMin,
            score: Number(score.toFixed(3)),
            success_prob: Number(stat.successProb.toFixed(3)),
            expected_fare_inr: Math.round(stat.expectedFare),
            normalized_fare: normalizedFare,
            traffic_penalty: Number(trafficPenalty.toFixed(2)),
            traffic_speed_idx: typeof stat.trafficSpeedIdx === "number" ? Number(stat.trafficSpeedIdx.toFixed(2)) : null,
            reason
        };
    });
    scored.sort((a, b)=>b.score - a.score);
    const trafficSpeedIdx = trafficSpeedSamples > 0 ? Number((trafficSpeedSum / trafficSpeedSamples).toFixed(2)) : normalizedContext.traffic_speed_idx ?? null;
    let trafficSource = trafficSnapshot.source;
    let topRecommendations = scored.slice(0, Math.max(1, k));
    // CRITICAL: Always ensure we return nearest zones when candidates exist
    if (topRecommendations.length === 0 && candidates.length > 0) {
        console.warn("[recommendations] scored list empty, falling back to nearest zones", {
            driverId,
            candidateCount: candidates.length,
            currentLoc
        });
        topRecommendations = buildFallbackRecommendations(candidates, k, currentSpeedKmh ?? null);
        trafficSource = "fallback";
    }
    // Additional safety: if topRecommendations is still empty but candidates exist, force nearest-by-distance
    if (topRecommendations.length === 0 && candidates.length > 0) {
        console.error("[recommendations] CRITICAL: topRecommendations empty despite candidates", {
            driverId,
            candidateCount: candidates.length,
            scoredCount: scored.length,
            currentLoc
        });
        const emergency = [
            ...candidates
        ].sort((a, b)=>a.distanceKm - b.distanceKm).slice(0, Math.max(1, k));
        topRecommendations = emergency.map((c)=>({
                zone_id: c.zone.id,
                zone_name: c.zone.name,
                lat: c.zone.lat,
                lon: c.zone.lon,
                distance_km: Number(c.distanceKm.toFixed(2)),
                eta_min: Number((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateETA"])(c.distanceKm * 1000, currentSpeedKmh ?? undefined).toFixed(1)),
                score: 0.5,
                success_prob: 0.35,
                expected_fare_inr: DEFAULT_FARE_INR,
                normalized_fare: 0.5,
                traffic_penalty: 0,
                traffic_speed_idx: null,
                reason: "Emergency fallback: nearest by distance"
            }));
        trafficSource = "fallback";
    }
    const contextSnapshot = {
        ...normalizedContext,
        traffic_speed_idx: trafficSpeedIdx,
        driver_id: driverId,
        snapped_zone: snappedZoneId,
        bucket_start: bucketIso,
        bucket_label: bucketLabel,
        traffic_source: trafficSource
    };
    return {
        computed_at: computedAt.toISOString(),
        context: contextSnapshot,
        top: topRecommendations,
        traffic_source: trafficSource
    };
}
async function fetchCandidateZones(supabase, currentLoc) {
    const { data, error } = await supabase.from("zones").select("id,name,lat,lon,center,radius_km,weight_demand,weight_airport,is_active").eq("is_active", true).limit(200);
    if (error || !data) {
        console.error("[recommendations] zone fetch failed", {
            error
        });
        return {
            candidates: [],
            totalZones: 0,
            zonesWithCoordinates: 0
        };
    }
    const rows = data;
    const totalZones = rows.length;
    if (totalZones === 0) {
        console.warn("[recommendations] No zones found in DB when building candidates");
        return {
            candidates: [],
            totalZones: 0,
            zonesWithCoordinates: 0
        };
    }
    const activeRows = rows.filter((row)=>row.is_active !== false);
    const prioritizedRows = activeRows.length > 0 ? activeRows : rows;
    const hardCap = 25;
    const defaultCollection = collectCandidateZones(prioritizedRows, currentLoc, DEFAULT_MAX_DISTANCE_KM * 1.5);
    let candidates = defaultCollection.candidates;
    let zonesWithCoordinates = defaultCollection.totalResolved;
    if (candidates.length === 0 && zonesWithCoordinates > 0) {
        const relaxedRadius = DEFAULT_MAX_DISTANCE_KM * 3;
        const relaxed = collectCandidateZones(prioritizedRows, currentLoc, relaxedRadius);
        if (relaxed.candidates.length > 0) {
            console.warn("[recommendations] No zones within default radius, using relaxed fallback", {
                totalZones,
                relaxedRadiusKm: relaxedRadius
            });
            candidates = relaxed.candidates;
            zonesWithCoordinates = relaxed.totalResolved;
        } else {
            console.warn("[recommendations] No zones within relaxed radius, defaulting to all zones sorted by distance", {
                totalZones,
                resolvedZones: zonesWithCoordinates
            });
            const allCandidates = collectCandidateZones(prioritizedRows, currentLoc);
            candidates = allCandidates.candidates;
            zonesWithCoordinates = allCandidates.totalResolved;
        }
    } else if (candidates.length === 0 && zonesWithCoordinates === 0) {
        console.warn("[recommendations] Zones exist but none contain usable coordinates", {
            totalZones
        });
    }
    return {
        candidates: candidates.slice(0, hardCap),
        totalZones,
        zonesWithCoordinates
    };
}
function collectCandidateZones(rows, currentLoc, maxDistanceKm) {
    const resolved = [];
    for (const row of rows){
        const coords = resolveZoneCoordinates(row);
        if (!coords) continue;
        const distance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["distanceKm"])(currentLoc.lat, currentLoc.lon, coords.lat, coords.lon);
        resolved.push({
            zone: {
                ...row,
                name: normalizeZoneName(row),
                lat: coords.lat,
                lon: coords.lon
            },
            distanceKm: distance
        });
    }
    resolved.sort((a, b)=>a.distanceKm - b.distanceKm);
    const filtered = typeof maxDistanceKm === "number" ? resolved.filter((candidate)=>candidate.distanceKm <= maxDistanceKm) : resolved;
    return {
        candidates: filtered,
        totalResolved: resolved.length
    };
}
function normalizeZoneName(row) {
    if (row.name && row.name.trim().length > 0) {
        return row.name.trim();
    }
    if (row.slug && row.slug.trim().length > 0) {
        return row.slug.replace(/_/g, " ").trim();
    }
    return `Zone ${row.id}`;
}
function resolveZoneCoordinates(row) {
    const lat = toFiniteNumber(row.lat);
    const lon = toFiniteNumber(row.lon);
    if (lat !== null && lon !== null) {
        return {
            lat,
            lon
        };
    }
    const fromCenter = parseGeometryValue(row.center);
    if (fromCenter) return fromCenter;
    const fromGeom = parseGeometryValue(row.geom);
    if (fromGeom) return fromGeom;
    return null;
}
function toFiniteNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    return null;
}
function parseGeometryValue(value) {
    if (!value) return null;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            try {
                const parsed = JSON.parse(trimmed);
                return parseGeometryValue(parsed);
            } catch  {
            // fall through to WKT parsing
            }
        }
        return parseWktPoint(trimmed);
    }
    const anyValue = value;
    if (Array.isArray(anyValue.coordinates) && anyValue.coordinates.length >= 2) {
        const [lon, lat] = anyValue.coordinates;
        const latNum = toFiniteNumber(lat);
        const lonNum = toFiniteNumber(lon);
        if (latNum !== null && lonNum !== null) {
            return {
                lat: latNum,
                lon: lonNum
            };
        }
    }
    const fallbackLat = toFiniteNumber(anyValue.lat ?? anyValue.latitude);
    const fallbackLon = toFiniteNumber(anyValue.lon ?? anyValue.lng ?? anyValue.longitude);
    if (fallbackLat !== null && fallbackLon !== null) {
        return {
            lat: fallbackLat,
            lon: fallbackLon
        };
    }
    return null;
}
function parseWktPoint(value) {
    const normalized = value.includes(";") ? value.split(";").pop().trim() : value.trim();
    const match = normalized.match(/POINT\s*\(([^)]+)\)/i);
    if (!match) return null;
    const [maybeLon, maybeLat] = match[1].trim().split(/\s+/);
    const lon = Number(maybeLon);
    const lat = Number(maybeLat);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return {
            lat,
            lon
        };
    }
    return null;
}
function buildFallbackRecommendations(candidates, k, currentSpeedKmh) {
    const limit = Math.max(1, k);
    const fallbackZones = [
        ...candidates
    ].sort((a, b)=>a.distanceKm - b.distanceKm).slice(0, limit);
    return fallbackZones.map((candidate)=>{
        const distanceKm = Number(candidate.distanceKm.toFixed(2));
        const etaMinutes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateETA"])(candidate.distanceKm * 1000, currentSpeedKmh ?? undefined);
        const normalizedDistance = clamp(distanceKm / (DEFAULT_MAX_DISTANCE_KM * 2), 0, 1);
        const demandWeight = typeof candidate.zone.weight_demand === "number" && candidate.zone.weight_demand > 0 ? clamp(candidate.zone.weight_demand, 0.5, 2) : 1;
        const airportWeight = typeof candidate.zone.weight_airport === "number" ? clamp(candidate.zone.weight_airport, 0, 2) : 0;
        const baseScore = 1 - normalizedDistance;
        const weightedScore = clamp(baseScore * demandWeight + airportWeight * 0.05, 0, 1);
        const successProb = clamp(0.35 * demandWeight, 0.2, 0.95);
        return {
            zone_id: candidate.zone.id,
            zone_name: candidate.zone.name,
            lat: candidate.zone.lat,
            lon: candidate.zone.lon,
            distance_km: distanceKm,
            eta_min: Number(etaMinutes.toFixed(1)),
            score: Number(weightedScore.toFixed(3)),
            success_prob: Number(successProb.toFixed(3)),
            expected_fare_inr: DEFAULT_FARE_INR,
            normalized_fare: clamp(0.5 * demandWeight, 0, 1),
            traffic_penalty: 0.2,
            traffic_speed_idx: null,
            reason: "Nearest zones by distance (fallback)"
        };
    });
}
async function loadTrainingSuccess(supabase, zoneIds, bucketStart, driverId) {
    const stats = new Map();
    if (zoneIds.length === 0) return stats;
    const lookback = new Date(bucketStart);
    lookback.setDate(lookback.getDate() - SUCCESS_LOOKBACK_DAYS);
    const { data, error } = await supabase.from("training_examples").select("zone_id,label_ride_15m,success_prob,sample_size,bucket_30m,created_at").in("zone_id", zoneIds).gte("created_at", lookback.toISOString());
    if (error || !data) {
        console.error("[recommendations] training fetch failed", {
            driverId,
            error
        });
        return stats;
    }
    for (const row of data){
        const zoneId = row.zone_id;
        const rowBucket = row.bucket_30m ?? row.created_at ?? bucketStart.toISOString();
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWithinSameBucket"])(rowBucket, bucketStart)) continue;
        const entry = stats.get(zoneId) ?? {
            prob: 0,
            samples: 0
        };
        const sampleSize = typeof row.sample_size === "number" && row.sample_size > 0 ? row.sample_size : 1;
        const labelValue = typeof row.success_prob === "number" && sampleSize > 1 ? clamp(row.success_prob, 0, 1) * sampleSize : normalizeLabel(row);
        entry.prob += labelValue;
        entry.samples += sampleSize;
        stats.set(zoneId, entry);
    }
    for (const [zoneId, entry] of stats.entries()){
        const smoothed = smoothProbability(entry.prob, entry.samples);
        stats.set(zoneId, {
            prob: smoothed,
            samples: entry.samples
        });
    }
    return stats;
}
async function loadExpectedFare(supabase, zoneIds, bucketStart, driverId) {
    const stats = new Map();
    if (zoneIds.length === 0) return stats;
    const lookback = new Date(bucketStart);
    lookback.setDate(lookback.getDate() - SUCCESS_LOOKBACK_DAYS);
    const { data, error } = await supabase.from("trips").select("pickup_zone,fare_inr,completed_at").in("pickup_zone", zoneIds).gte("completed_at", lookback.toISOString());
    if (error || !data) {
        console.error("[recommendations] trip fare fetch failed", {
            driverId,
            error
        });
        return stats;
    }
    for (const row of data){
        if (!row.pickup_zone) continue;
        const completedAt = row.completed_at;
        if (!completedAt || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isWithinSameBucket"])(completedAt, bucketStart)) continue;
        if (typeof row.fare_inr !== "number" || row.fare_inr <= 0) continue;
        const entry = stats.get(row.pickup_zone) ?? {
            sum: 0,
            count: 0
        };
        entry.sum += row.fare_inr;
        entry.count += 1;
        stats.set(row.pickup_zone, entry);
    }
    return stats;
}
function normalizeContext(context) {
    return {
        traffic_speed_idx: typeof context?.traffic_speed_idx === "number" ? clamp(context.traffic_speed_idx, 0, 1) : null,
        route_incident: Boolean(context?.route_incident),
        airport_wave: typeof context?.airport_wave === "number" ? clamp(context.airport_wave, 0, 1) : null,
        weather_flag_rain: Boolean(context?.weather_flag_rain),
        event_flag: Boolean(context?.event_flag)
    };
}
function computeZoneTrafficPenalty(trafficSpeedIdx, context) {
    const effectiveIdx = typeof trafficSpeedIdx === "number" ? clamp(trafficSpeedIdx, 0, 1) : typeof context.traffic_speed_idx === "number" ? clamp(context.traffic_speed_idx, 0, 1) : null;
    const speedPenalty = effectiveIdx !== null ? 1 - effectiveIdx : 0.2;
    const incidentPenalty = context.route_incident ? 0.5 : 0;
    const weatherPenalty = context.weather_flag_rain ? 0.3 : 0;
    return clamp(speedPenalty + incidentPenalty + weatherPenalty, 0, 1);
}
function buildReason(stat, normalizedFare, trafficSpeedIdx, context) {
    const reasons = [];
    if (stat.successProb >= 0.65) {
        reasons.push("High hit rate");
    } else if (stat.successProb >= 0.5) {
        reasons.push("Steady bookings");
    }
    if (normalizedFare >= 0.7) {
        reasons.push("Premium fares");
    } else if (stat.expectedFare >= DEFAULT_FARE_INR + 40) {
        reasons.push("Above avg fare");
    }
    if (stat.distanceKm <= 2) {
        reasons.push("Very close");
    } else if (stat.distanceKm <= 5) {
        reasons.push("Nearby");
    }
    if (typeof trafficSpeedIdx === "number") {
        if (trafficSpeedIdx >= 0.8) {
            reasons.push("Traffic flowing");
        } else if (trafficSpeedIdx < 0.5) {
            reasons.push("Heavy traffic");
        }
    }
    if (context.airport_wave && /airport/i.test(stat.zoneName)) {
        reasons.push("Airport arrivals");
    }
    if (context.event_flag) {
        reasons.push("Event demand");
    }
    if (reasons.length === 0) {
        reasons.push("Balanced demand vs travel time");
    }
    return reasons.slice(0, 3).join("; ");
}
async function resolveTrafficSnapshot(opts) {
    const destKey = opts.candidates.map((c)=>c.zone.id).sort((a, b)=>a - b).join(",");
    const cached = driverTrafficCache.get(opts.driverId);
    if (cached && cached.destKey === destKey) {
        const movedMeters = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["distanceKm"])(opts.origin.lat, opts.origin.lon, cached.origin.lat, cached.origin.lon) * 1000;
        const ageMs = Date.now() - cached.snapshot.fetchedAt;
        if (movedMeters < TRAFFIC_REUSE_DISTANCE_METERS && ageMs < TRAFFIC_REUSE_INTERVAL_MS) {
            return {
                entries: new Map(cached.snapshot.entries),
                source: cached.snapshot.source === "google" ? "cache" : cached.snapshot.source,
                fetchedAt: cached.snapshot.fetchedAt
            };
        }
    }
    const destinations = opts.candidates.map((candidate)=>({
            zoneId: candidate.zone.id,
            lat: candidate.zone.lat,
            lon: candidate.zone.lon
        }));
    try {
        const matrix = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$googleMaps$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getTrafficMatrix"])({
            origin: opts.origin,
            destinations,
            departureTime: opts.departure
        });
        const snapshot = buildTrafficSnapshotFromMatrix(matrix);
        driverTrafficCache.set(opts.driverId, {
            destKey,
            origin: opts.origin,
            snapshot
        });
        return snapshot;
    } catch (error) {
        console.warn("[recommendations] traffic matrix failed, using fallback", {
            driverId: opts.driverId,
            error
        });
        const fallback = buildFallbackTrafficSnapshot(opts.candidates, opts.currentSpeedKmh);
        driverTrafficCache.set(opts.driverId, {
            destKey,
            origin: opts.origin,
            snapshot: fallback
        });
        return fallback;
    }
}
function buildTrafficSnapshotFromMatrix(entries) {
    const map = new Map();
    for (const entry of entries){
        map.set(entry.zoneId, {
            zoneId: entry.zoneId,
            distanceMeters: entry.distanceMeters,
            durationSeconds: entry.durationSeconds,
            durationInTrafficSeconds: entry.durationInTrafficSeconds,
            trafficSpeedIdx: computeSpeedIndex(entry),
            status: entry.status
        });
    }
    return {
        entries: map,
        source: "google",
        fetchedAt: Date.now()
    };
}
function buildFallbackTrafficSnapshot(candidates, currentSpeedKmh) {
    const map = new Map();
    for (const candidate of candidates){
        const distanceMeters = candidate.distanceKm * 1000;
        const etaSeconds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateETA"])(distanceMeters, currentSpeedKmh) * 60;
        map.set(candidate.zone.id, {
            zoneId: candidate.zone.id,
            distanceMeters,
            durationSeconds: etaSeconds,
            durationInTrafficSeconds: etaSeconds,
            trafficSpeedIdx: null,
            status: "FALLBACK"
        });
    }
    return {
        entries: map,
        source: "fallback",
        fetchedAt: Date.now()
    };
}
function computeSpeedIndex(entry) {
    if (!entry.durationSeconds || !entry.durationInTrafficSeconds || entry.durationSeconds <= 0 || entry.durationInTrafficSeconds <= 0) {
        return null;
    }
    const ratio = entry.durationSeconds / entry.durationInTrafficSeconds;
    return clamp(ratio, 0, 1);
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function normalizeLabel(row) {
    if (typeof row.success_prob === "number") {
        return row.success_prob;
    }
    if (typeof row.label_ride_15m === "number") {
        return clamp(row.label_ride_15m, 0, 1);
    }
    if (typeof row.label_ride_15m === "boolean") {
        return row.label_ride_15m ? 1 : 0;
    }
    return 0;
}
function smoothProbability(successSum, samples) {
    return (successSum + 1) / (samples + 2);
}
function resolveFallbackFare(stats) {
    if (stats.size === 0) return DEFAULT_FARE_INR;
    let sum = 0;
    let count = 0;
    for (const entry of stats.values()){
        sum += entry.sum;
        count += entry.count;
    }
    if (count === 0) return DEFAULT_FARE_INR;
    return sum / count;
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseConfig",
    ()=>getSupabaseConfig
]);
const isServer = ()=>("TURBOPACK compile-time value", "undefined") === "undefined";
function getSupabaseConfig() {
    const serverUrl = process.env.SUPABASE_URL || ("TURBOPACK compile-time value", "https://spqlnfacobphbttgptdv.supabase.co");
    const serverAnonKey = process.env.SUPABASE_ANON_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcWxuZmFjb2JwaGJ0dGdwdGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDQ5MTIsImV4cCI6MjA3ODIyMDkxMn0.5yC-IL2q7mhXJBf1RGFqfSeSqYNE8mRMVe77Sw9I7yg");
    const url = isServer() ? serverUrl : "TURBOPACK unreachable";
    const anonKey = isServer() ? serverAnonKey : "TURBOPACK unreachable";
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return {
        url,
        anonKey
    };
}
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createServerSupabaseClient",
    ()=>createServerSupabaseClient,
    "loadProfile",
    ()=>loadProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/config.ts [app-route] (ecmascript)");
;
;
;
function mapUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email ?? null,
        fullName: user.user_metadata?.full_name ?? null
    };
}
async function createServerSupabaseClient() {
    const { url, anonKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseConfig"])();
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(url, anonKey, {
        cookies: {
            get (name) {
                return cookieStore.get(name)?.value;
            },
            set (name, value, options) {
                const mutableStore = cookieStore;
                mutableStore.set?.({
                    name,
                    value,
                    ...options
                });
            },
            remove (name, options) {
                const mutableStore = cookieStore;
                mutableStore.set?.({
                    name,
                    value: "",
                    ...options,
                    maxAge: 0
                });
            }
        }
    });
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error && error.message !== "Auth session missing!") {
        console.warn("[supabase] auth.getUser failed", error);
    }
    return {
        supabase,
        user: mapUser(user)
    };
}
async function loadProfile(supabase, userId) {
    const { data, error } = await supabase.from("profiles").select("id,full_name,created_at").eq("id", userId).maybeSingle();
    if (error && error.code !== "PGRST116") {
        console.warn("[supabase] failed to load profile", {
            userId,
            error
        });
        return null;
    }
    return data ?? null;
}
}),
"[project]/app/api/recommendations/next-spot/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$recommendation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/recommendation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
;
;
const CACHE_TTL_MS = 60_000;
async function GET(req) {
    const url = new URL(req.url);
    const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
    if (!user) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Please sign in", null, 401, "UNAUTHENTICATED");
    }
    const latParam = url.searchParams.get("lat");
    const lonParam = url.searchParams.get("lon");
    const kParam = url.searchParams.get("k");
    const hasExplicitCoords = latParam !== null && lonParam !== null;
    const k = Math.min(Math.max(parseInt(kParam ?? "3", 10) || 3, 1), 10);
    let currentLoc = null;
    let snappedZoneId = null;
    let speedKmh = null;
    let responseSource = "live";
    let driverState = null;
    if (hasExplicitCoords) {
        const lat = Number(latParam);
        const lon = Number(lonParam);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Invalid coordinates", {
                lat: latParam,
                lon: lonParam
            }, 400, "INVALID_INPUT");
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLatitude"])(lat) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLongitude"])(lon)) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Coordinates out of range", {
                lat,
                lon
            }, 400, "INVALID_INPUT");
        }
        currentLoc = {
            lat,
            lon
        };
    } else {
        const { data: stateRow, error: stateError, status: stateStatus } = await supabase.from("driver_state").select("loc,speed_kmh,snapped_zone,recommendation,updated_at").eq("driver_id", user.id).maybeSingle();
        if (stateError && stateStatus !== 406 && stateError.code !== "PGRST116") {
            if (stateStatus === 401) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Please sign in", null, 401, "UNAUTHENTICATED");
            }
            if (stateStatus === 403 || stateError.code === "42501") {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Forbidden", null, 403, "FORBIDDEN");
            }
            console.error("[next-spot] driver_state fetch failed", {
                driverId: user.id,
                error: stateError
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Database error while reading driver_state", stateError, 500, "DB_ERROR");
        }
        if (stateRow) {
            driverState = stateRow;
            const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["latLonFromPoint"])(stateRow.loc);
            if (coords.lat !== null && coords.lon !== null) {
                currentLoc = {
                    lat: coords.lat,
                    lon: coords.lon
                };
            }
            speedKmh = stateRow.speed_kmh;
            snappedZoneId = stateRow.snapped_zone;
        }
    }
    if (!currentLoc) {
        const { data: latestPing, error: pingError } = await supabase.from("pings").select("loc,speed_kmh").eq("driver_id", user.id).order("ts", {
            ascending: false
        }).limit(1).maybeSingle();
        if (pingError && pingError.code !== "PGRST116") {
            console.error("[next-spot] latest ping lookup failed", {
                driverId: user.id,
                error: pingError
            });
        } else {
            const fallback = latestPing;
            if (fallback?.loc) {
                const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["latLonFromPoint"])(fallback.loc);
                if (coords.lat !== null && coords.lon !== null) {
                    currentLoc = {
                        lat: coords.lat,
                        lon: coords.lon
                    };
                    if (speedKmh === null && typeof fallback.speed_kmh === "number") {
                        speedKmh = fallback.speed_kmh;
                    }
                }
            }
        }
    }
    if (!currentLoc) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            error: {
                code: "NO_STATE",
                message: "No recent location found. Enable live tracking or pass lat/lon."
            }
        });
    }
    const { lat, lon } = currentLoc;
    if (!hasExplicitCoords && driverState?.recommendation) {
        const updatedAt = new Date(driverState.updated_at).getTime();
        if (Date.now() - updatedAt < CACHE_TTL_MS) {
            responseSource = "cached";
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
                computed_at: driverState.recommendation.computed_at ?? driverState.updated_at,
                source: responseSource,
                traffic_source: driverState.recommendation.traffic_source ?? null,
                context: driverState.recommendation.context ?? null,
                top: driverState.recommendation.top ?? []
            });
        }
    }
    if (!snappedZoneId) {
        const { data: zoneData, error: zoneError } = await supabase.rpc("nearest_zone", {
            p_lon: lon,
            p_lat: lat,
            p_max_m: 3000
        });
        if (zoneError) {
            console.error("[next-spot] nearest_zone failed", {
                driverId: user.id,
                error: zoneError
            });
        } else if (typeof zoneData === "number") {
            snappedZoneId = zoneData;
        }
    }
    try {
        const recommendation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$recommendation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeNextZonesForDriver"])({
            supabase,
            driverId: user.id,
            currentLoc,
            snappedZoneId,
            now: new Date(),
            currentSpeedKmh: speedKmh ?? undefined,
            k
        });
        if (recommendation.traffic_source === "fallback") {
            responseSource = "fallback";
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            computed_at: recommendation.computed_at,
            source: responseSource,
            traffic_source: recommendation.traffic_source,
            context: recommendation.context,
            top: recommendation.top
        });
    } catch (error) {
        console.error("[next-spot] computeNextZonesForDriver failed", {
            userId: user.id,
            currentLoc,
            error
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Failed to compute recommendations", null, 500, "DB_ERROR");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ff4483d6._.js.map