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
"[project]/lib/auth-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "requireAdmin",
    ()=>requireAdmin,
    "requireUser",
    ()=>requireUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function requireUser(_ = undefined) {
    const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](401, "UNAUTHORIZED", "Unauthorized");
    }
    return {
        supabase,
        user
    };
}
async function requireAdmin(req) {
    const { supabase, user } = await requireUser(req);
    const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    if (error || !profile?.is_admin) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](403, "FORBIDDEN", "Forbidden", error);
    }
    return {
        supabase,
        user
    };
}
}),
"[project]/lib/server/geo-utils.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Server-side geospatial utilities for Patna EV Co-Pilot
 * All geographic calculations for recommendations and distance estimation
 */ /**
 * Calculate Haversine distance between two points in meters
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
    ()=>isWithinPatnaBounds
]);
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
"[project]/lib/server/recommendation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeNextZonesForDriver",
    ()=>computeNextZonesForDriver
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/time-utils.ts [app-route] (ecmascript)");
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
async function computeNextZonesForDriver(params) {
    const { supabase, driverId, currentLoc, snappedZoneId = null, k = 3, context, now, currentSpeedKmh } = params;
    const computedAt = typeof now === "string" ? new Date(now) : now ? now : new Date();
    const bucketStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["truncateTo30MinBucket"])(computedAt);
    const bucketIso = bucketStart.toISOString();
    const bucketLabel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$time$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bucketLabel"])(bucketStart);
    const normalizedContext = normalizeContext(context);
    const candidates = await fetchCandidateZones(supabase, currentLoc);
    if (candidates.length === 0) {
        return {
            computed_at: computedAt.toISOString(),
            context: {
                ...normalizedContext,
                driver_id: driverId,
                snapped_zone_id: snappedZoneId,
                bucket_start: bucketIso,
                bucket_label: bucketLabel
            },
            top: []
        };
    }
    const zoneIds = candidates.map((c)=>c.zone.id).filter(Boolean);
    const [successStats, fareStats] = await Promise.all([
        loadTrainingSuccess(supabase, zoneIds, bucketStart, driverId),
        loadExpectedFare(supabase, zoneIds, bucketStart, driverId)
    ]);
    const fallbackFare = resolveFallbackFare(fareStats);
    const zoneWithStats = candidates.map((candidate)=>{
        const zoneId = candidate.zone.id;
        const successEntry = successStats.get(zoneId);
        const successProb = successEntry ? successEntry.prob : 0.35; // optimistic default
        const fareEntry = fareStats.get(zoneId);
        const expectedFare = fareEntry && fareEntry.count > 0 ? fareEntry.sum / fareEntry.count : fallbackFare;
        const distanceKm = Number(candidate.distanceKm.toFixed(2));
        const etaMin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["estimateETA"])(distanceKm * 1000, currentSpeedKmh);
        return {
            zoneId,
            zoneName: candidate.zone.name,
            distanceKm,
            etaMin,
            successProb,
            expectedFare
        };
    });
    const maxFare = zoneWithStats.reduce((max, zone)=>Math.max(max, zone.expectedFare), fallbackFare);
    const trafficPenalty = computeTrafficPenalty(normalizedContext);
    const scored = zoneWithStats.map((stat)=>{
        const normalizedFare = maxFare > 0 ? Number((stat.expectedFare / maxFare).toFixed(3)) : 0;
        const etaPenalty = Math.min(stat.etaMin / 30, 1);
        const rawScore = SCORE_WEIGHTS.success * stat.successProb + SCORE_WEIGHTS.fare * normalizedFare - SCORE_WEIGHTS.eta * etaPenalty - SCORE_WEIGHTS.traffic * trafficPenalty;
        const score = clamp(rawScore, 0, 1);
        const reason = buildReason(stat, normalizedFare, normalizedContext);
        return {
            zone_id: stat.zoneId,
            zone_name: stat.zoneName,
            distance_km: stat.distanceKm,
            eta_min: Number(stat.etaMin.toFixed(1)),
            score: Number(score.toFixed(3)),
            success_prob: Number(stat.successProb.toFixed(3)),
            expected_fare_inr: Math.round(stat.expectedFare),
            normalized_fare: normalizedFare,
            traffic_penalty: Number(trafficPenalty.toFixed(2)),
            reason
        };
    });
    scored.sort((a, b)=>b.score - a.score);
    return {
        computed_at: computedAt.toISOString(),
        context: {
            ...normalizedContext,
            driver_id: driverId,
            snapped_zone_id: snappedZoneId,
            bucket_start: bucketIso,
            bucket_label: bucketLabel
        },
        top: scored.slice(0, Math.max(1, k))
    };
}
async function fetchCandidateZones(supabase, currentLoc) {
    const { data, error } = await supabase.from("zones").select("id,name,lat,lon").limit(200);
    if (error || !data) {
        console.error("[recommendations] zone fetch failed", {
            error
        });
        return [];
    }
    const candidates = [];
    for (const zone of data){
        if (zone.lat === null || zone.lon === null) continue;
        const distance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["distanceKm"])(currentLoc.lat, currentLoc.lon, zone.lat, zone.lon);
        if (distance > DEFAULT_MAX_DISTANCE_KM * 1.5) continue;
        candidates.push({
            zone,
            distanceKm: distance
        });
    }
    return candidates.sort((a, b)=>a.distanceKm - b.distanceKm).slice(0, 20);
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
    const bucketIso = bucketStart.toISOString();
    for (const row of data){
        const zoneId = row.zone_id;
        // Only consider current bucket (fallback to created_at bucket)
        const rowBucket = row.bucket_30m ?? row.created_at ?? bucketIso;
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
        const currentAvg = stats.get(row.pickup_zone);
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
function computeTrafficPenalty(context) {
    const speedPenalty = context.traffic_speed_idx !== null && context.traffic_speed_idx !== undefined ? 1 - context.traffic_speed_idx : 0.2; // assume slightly slow if unknown
    const incidentPenalty = context.route_incident ? 0.5 : 0;
    const weatherPenalty = context.weather_flag_rain ? 0.3 : 0;
    return clamp(speedPenalty + incidentPenalty + weatherPenalty, 0, 1);
}
function buildReason(stat, normalizedFare, context) {
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
"[project]/app/api/recommendations/next-spot/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$recommendation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/recommendation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
;
;
;
;
const CACHE_TTL_MS = 60_000;
async function GET(req) {
    try {
        const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
        const url = new URL(req.url);
        const latParam = url.searchParams.get("lat");
        const lonParam = url.searchParams.get("lon");
        const kParam = url.searchParams.get("k");
        const k = Math.min(Math.max(parseInt(kParam ?? "3", 10) || 3, 1), 10);
        let lat = null;
        let lon = null;
        let snappedZoneId = null;
        let speedKmh = null;
        let source = "live";
        let driverState = null;
        if (latParam && lonParam) {
            lat = Number(latParam);
            lon = Number(lonParam);
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
        } else {
            const { data, error } = await supabase.from("driver_state").select("lat,lon,speed_kmh,snapped_zone_id,recommendation,updated_at").eq("driver_id", user.id).maybeSingle();
            if (error && error.code !== "PGRST116") {
                console.error("[next-spot] driver_state fetch failed", {
                    driverId: user.id,
                    error
                });
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Failed to fetch driver state", null, 500, "DB_ERROR");
            }
            if (!data) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("No location data available", {
                    hint: "Send a ping first or provide lat/lon query params"
                }, 400, "INVALID_INPUT");
            }
            driverState = data;
            lat = data.lat;
            lon = data.lon;
            speedKmh = data.speed_kmh;
            snappedZoneId = data.snapped_zone_id;
        }
        if (lat === null || lon === null) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Missing coordinates", null, 400, "INVALID_INPUT");
        }
        if (!latParam && !lonParam && driverState?.recommendation) {
            const updatedAt = new Date(driverState.updated_at).getTime();
            if (Date.now() - updatedAt < CACHE_TTL_MS) {
                source = "cached";
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
                    computed_at: driverState.recommendation.computed_at ?? driverState.updated_at,
                    source,
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
        const recommendation = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$recommendation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["computeNextZonesForDriver"])({
            supabase,
            driverId: user.id,
            currentLoc: {
                lat,
                lon
            },
            snappedZoneId,
            now: new Date(),
            currentSpeedKmh: speedKmh ?? undefined,
            k
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            computed_at: recommendation.computed_at,
            source,
            context: recommendation.context,
            top: recommendation.top
        });
    } catch (error) {
        if (error.message === "Unauthorized") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Unauthorized", null, 401, "UNAUTHORIZED");
        }
        console.error("[next-spot] unexpected error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Unexpected error", null, 500, "INTERNAL_ERROR");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a86a9ef4._.js.map