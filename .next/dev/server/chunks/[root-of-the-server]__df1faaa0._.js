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
"[project]/app/api/driver-state/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    let userId = null;
    try {
        const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        if (!user) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Please sign in", null, 401, "UNAUTHENTICATED");
        }
        userId = user.id;
        const { data, error, status } = await supabase.from("driver_state").select("driver_id,last_ping_at,loc,snapped_zone,speed_kmh,battery_pct,accuracy_m,recommendation,updated_at")// driver_state rows are keyed by driver_id via RLS (auth.uid())
        .eq("driver_id", user.id).maybeSingle();
        if (error) {
            if (status === 401) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Please sign in", null, 401, "UNAUTHENTICATED");
            }
            if (status === 403) {
                return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Forbidden", null, 403, "FORBIDDEN");
            }
            console.error("[driver-state] supabase query failed", {
                userId,
                status,
                error
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Failed to fetch driver state", null, 500, "DB_ERROR");
        }
        if (!data) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])(null);
        }
        const row = data;
        const coords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["latLonFromPoint"])(row.loc);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            driver_id: row.driver_id,
            last_ping_at: row.last_ping_at,
            snapped_zone: row.snapped_zone,
            loc: row.loc,
            lat: coords.lat,
            lon: coords.lon,
            speed_kmh: row.speed_kmh,
            battery_pct: row.battery_pct,
            accuracy_m: row.accuracy_m ?? null,
            recommendation: row.recommendation,
            updated_at: row.updated_at
        });
    } catch (error) {
        console.error("GET /api/driver-state failed", {
            userId,
            error
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Failed to fetch driver state", null, 500, "DB_ERROR");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__df1faaa0._.js.map