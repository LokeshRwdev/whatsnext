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
"[project]/lib/zod-schemas.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AdminEventReq",
    ()=>AdminEventReq,
    "AdminZoneReq",
    ()=>AdminZoneReq,
    "AirportWaveSchema",
    ()=>AirportWaveSchema,
    "ApiErrorSchema",
    ()=>ApiErrorSchema,
    "CancelReasonSchema",
    ()=>CancelReasonSchema,
    "ChargeSchema",
    ()=>ChargeSchema,
    "CityEventSchema",
    ()=>CityEventSchema,
    "CreateChargeReq",
    ()=>CreateChargeReq,
    "CreatePingReq",
    ()=>CreatePingReq,
    "CreateRideEventReq",
    ()=>CreateRideEventReq,
    "CreateZoneVisitReq",
    ()=>CreateZoneVisitReq,
    "CreatedResponseSchema",
    ()=>CreatedResponseSchema,
    "DataResponseSchema",
    ()=>DataResponseSchema,
    "DriverStateSchema",
    ()=>DriverStateSchema,
    "HealthSchema",
    ()=>HealthSchema,
    "HotspotSchema",
    ()=>HotspotSchema,
    "OpsDailyUpsertReq",
    ()=>OpsDailyUpsertReq,
    "PingResponseSchema",
    ()=>PingResponseSchema,
    "PingSchema",
    ()=>PingSchema,
    "PlatformSchema",
    ()=>PlatformSchema,
    "RecommendationSchema",
    ()=>RecommendationSchema,
    "RideEventIngestSchema",
    ()=>RideEventIngestSchema,
    "RideEventSchema",
    ()=>RideEventSchema,
    "RideEventTypeSchema",
    ()=>RideEventTypeSchema,
    "TripSyncReq",
    ()=>TripSyncReq,
    "UpdateZoneVisitReq",
    ()=>UpdateZoneVisitReq,
    "WeatherSchema",
    ()=>WeatherSchema,
    "ZoneSchema",
    ()=>ZoneSchema,
    "ZoneVisitSchema",
    ()=>ZoneVisitSchema,
    "registry",
    ()=>registry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$asteasolutions$2f$zod$2d$to$2d$openapi$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@asteasolutions/zod-to-openapi/dist/index.mjs [app-route] (ecmascript)");
;
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$asteasolutions$2f$zod$2d$to$2d$openapi$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["extendZodWithOpenApi"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"]);
const registry = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$asteasolutions$2f$zod$2d$to$2d$openapi$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OpenAPIRegistry"]();
const ApiErrorSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    error: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    details: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any().optional()
});
const HealthSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ok: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    time: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const RideEventTypeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "booking_received",
    "ride_started",
    "ride_completed",
    "booking_cancelled"
]);
const PlatformSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "ola",
    "uber"
]);
const CancelReasonSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
    "driver",
    "rider",
    "platform"
]);
const ZoneSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    geohash6: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    is_airport: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    is_charger: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    meta: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).nullable()
});
const RideEventSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    driver_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    event_type: RideEventTypeSchema,
    occurred_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().nullable(),
    geohash6: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    battery_pct: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).nullable(),
    created_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const ZoneVisitSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    driver_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    arrived_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    left_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().nullable(),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).nullable(),
    created_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const PingSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    driver_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    ts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    speed_kmh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    battery_pct: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).nullable(),
    created_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const ChargeSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    driver_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    station_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().nullable(),
    start_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    end_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().nullable(),
    kwh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    cost_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    created_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const CityEventSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable(),
    venue_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    start_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    end_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    impact_score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    created_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const CreateRideEventReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    event_type: RideEventTypeSchema,
    occurred_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
    lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
    battery_pct: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).nullable().optional()
});
const RideEventIngestSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    event_type: RideEventTypeSchema,
    occurred_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    platform: PlatformSchema.optional(),
    fare_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    distance_km: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    pickup_lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-90).max(90).optional(),
    pickup_lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-180).max(180).optional(),
    drop_lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-90).max(90).optional(),
    drop_lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-180).max(180).optional(),
    surge_multiplier: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(10).optional(),
    promo_code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(64).optional(),
    cancel_reason: CancelReasonSchema.optional(),
    deadhead_distance_km: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(200).optional(),
    deadhead_time_min: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(600).optional()
}).refine((data)=>data.pickup_lat === undefined && data.pickup_lon === undefined || data.pickup_lat !== undefined && data.pickup_lon !== undefined, {
    message: "pickup_lat and pickup_lon must be provided together",
    path: [
        "pickup_lat"
    ]
}).refine((data)=>data.drop_lat === undefined && data.drop_lon === undefined || data.drop_lat !== undefined && data.drop_lon !== undefined, {
    message: "drop_lat and drop_lon must be provided together",
    path: [
        "drop_lat"
    ]
}).refine((data)=>data.event_type !== "booking_cancelled" || data.cancel_reason !== undefined, {
    message: "cancel_reason required for booking_cancelled events",
    path: [
        "cancel_reason"
    ]
});
const TripSyncReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    booking_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    pickup_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    drop_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    pickup_lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-90).max(90),
    pickup_lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-180).max(180),
    drop_lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-90).max(90),
    drop_lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-180).max(180),
    distance_km: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0),
    fare_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0),
    platform: PlatformSchema,
    surge_multiplier: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(10).optional(),
    promo_code: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(64).optional(),
    deadhead_km: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(200).optional(),
    deadhead_min: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(600).optional(),
    tip_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional()
});
const OpsDailyUpsertReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/, "day must be YYYY-MM-DD").optional(),
    platforms: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(PlatformSchema).min(1).optional(),
    idle_minutes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).optional(),
    fuel_litres: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    fuel_cost_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    energy_kwh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    energy_cost_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    tolls_parking_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    notes: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(512).optional()
});
const CreateZoneVisitReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    arrived_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
});
const UpdateZoneVisitReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    left_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const CreatePingReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ts: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-90).max(90),
    lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(-180).max(180),
    speed_kmh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(200).nullable().optional(),
    battery_pct: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).nullable().optional(),
    traffic_context: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        traffic_speed_idx: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(1).optional(),
        route_incident: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        airport_wave: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(1).optional(),
        weather_flag_rain: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
        event_flag: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional()
    }).optional()
});
const CreateChargeReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    station_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().nullable().optional(),
    start_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().optional(),
    end_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime().nullable().optional(),
    kwh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional(),
    cost_inr: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable().optional()
});
const AdminZoneReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    is_airport: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    is_charger: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().optional(),
    meta: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].any()).optional()
});
const AdminEventReq = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    venue_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    start_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    end_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    impact_score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional()
});
const DataResponseSchema = (dataSchema)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        data: dataSchema
    });
const CreatedResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    data: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        created: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional()
    })
});
const RecommendationSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    zone_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    distance_km: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    eta_min: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
const DriverStateSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    driver_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    last_ping_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    snapped_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().nullable(),
    speed_kmh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    battery_pct: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).max(100).nullable(),
    recommendation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(RecommendationSchema).nullable(),
    updated_at: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime()
});
const PingResponseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    snapped_zone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().nullable(),
    recommendation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(RecommendationSchema)
});
const WeatherSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    hour: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().datetime(),
    temp_c: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    humidity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    wind_kmh: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    rain_mm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable()
});
const AirportWaveSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    bucket: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    arrival_wave: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable(),
    departure_wave: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().nullable()
});
const HotspotSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid(),
    bucket: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    popularity_index: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number()
});
// ===== Register Components =====
registry.register("ApiError", ApiErrorSchema.openapi("ApiError"));
registry.register("Health", HealthSchema.openapi("Health"));
registry.register("Zone", ZoneSchema.openapi("Zone"));
registry.register("RideEvent", RideEventSchema.openapi("RideEvent"));
registry.register("ZoneVisit", ZoneVisitSchema.openapi("ZoneVisit"));
registry.register("Ping", PingSchema.openapi("Ping"));
registry.register("Charge", ChargeSchema.openapi("Charge"));
registry.register("CityEvent", CityEventSchema.openapi("CityEvent"));
registry.register("Recommendation", RecommendationSchema.openapi("Recommendation"));
registry.register("DriverState", DriverStateSchema.openapi("DriverState"));
registry.register("PingResponse", PingResponseSchema.openapi("PingResponse"));
registry.register("Weather", WeatherSchema.openapi("Weather"));
registry.register("AirportWave", AirportWaveSchema.openapi("AirportWave"));
registry.register("Hotspot", HotspotSchema.openapi("Hotspot"));
registry.register("CreateRideEventReq", CreateRideEventReq.openapi("CreateRideEventReq"));
registry.register("CreateZoneVisitReq", CreateZoneVisitReq.openapi("CreateZoneVisitReq"));
registry.register("UpdateZoneVisitReq", UpdateZoneVisitReq.openapi("UpdateZoneVisitReq"));
registry.register("CreatePingReq", CreatePingReq.openapi("CreatePingReq"));
registry.register("CreateChargeReq", CreateChargeReq.openapi("CreateChargeReq"));
registry.register("AdminZoneReq", AdminZoneReq.openapi("AdminZoneReq"));
registry.register("AdminEventReq", AdminEventReq.openapi("AdminEventReq"));
// ===== Register Paths =====
// Health
registry.registerPath({
    method: "get",
    path: "/api/health",
    tags: [
        "System"
    ],
    summary: "Health check",
    responses: {
        200: {
            description: "System is healthy",
            content: {
                "application/json": {
                    schema: DataResponseSchema(HealthSchema)
                }
            }
        }
    }
});
// Zones
registry.registerPath({
    method: "get",
    path: "/api/zones",
    tags: [
        "Zones"
    ],
    summary: "List all zones",
    security: [
        {
            bearerAuth: []
        }
    ],
    responses: {
        200: {
            description: "List of zones",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ZoneSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Ride Events
registry.registerPath({
    method: "post",
    path: "/api/ride-events",
    tags: [
        "Ride Events"
    ],
    summary: "Create a ride event",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateRideEventReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Ride event created",
            content: {
                "application/json": {
                    schema: CreatedResponseSchema
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/ride-events",
    tags: [
        "Ride Events"
    ],
    summary: "List own ride events",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    },
    responses: {
        200: {
            description: "List of ride events",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(RideEventSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/ride-events/{id}",
    tags: [
        "Ride Events"
    ],
    summary: "Get a ride event by ID",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        params: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid()
        })
    },
    responses: {
        200: {
            description: "Ride event details",
            content: {
                "application/json": {
                    schema: DataResponseSchema(RideEventSchema)
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Zone Visits
registry.registerPath({
    method: "post",
    path: "/api/zone-visits",
    tags: [
        "Zone Visits"
    ],
    summary: "Create a zone visit",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateZoneVisitReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Zone visit created",
            content: {
                "application/json": {
                    schema: CreatedResponseSchema
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/zone-visits",
    tags: [
        "Zone Visits"
    ],
    summary: "List own zone visits",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    },
    responses: {
        200: {
            description: "List of zone visits",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ZoneVisitSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "patch",
    path: "/api/zone-visits/{id}",
    tags: [
        "Zone Visits"
    ],
    summary: "Update zone visit left_at",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        params: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: UpdateZoneVisitReq
                }
            }
        }
    },
    responses: {
        200: {
            description: "Zone visit updated",
            content: {
                "application/json": {
                    schema: DataResponseSchema(ZoneVisitSchema)
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Pings
registry.registerPath({
    method: "post",
    path: "/api/pings",
    tags: [
        "Tracking"
    ],
    summary: "Submit GPS ping and receive recommendations",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreatePingReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Ping processed, recommendations computed",
            content: {
                "application/json": {
                    schema: DataResponseSchema(PingResponseSchema)
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Charges
registry.registerPath({
    method: "post",
    path: "/api/charges",
    tags: [
        "Charges"
    ],
    summary: "Create a charge record",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: CreateChargeReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Charge created",
            content: {
                "application/json": {
                    schema: CreatedResponseSchema
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/charges",
    tags: [
        "Charges"
    ],
    summary: "List own charges",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    },
    responses: {
        200: {
            description: "List of charges",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ChargeSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Context APIs
registry.registerPath({
    method: "get",
    path: "/api/context/weather",
    tags: [
        "Context"
    ],
    summary: "Get latest weather observation",
    security: [
        {
            bearerAuth: []
        }
    ],
    responses: {
        200: {
            description: "Latest weather data",
            content: {
                "application/json": {
                    schema: DataResponseSchema(WeatherSchema.nullable())
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/context/airport-wave",
    tags: [
        "Context"
    ],
    summary: "Get current airport wave data",
    security: [
        {
            bearerAuth: []
        }
    ],
    responses: {
        200: {
            description: "Airport wave data",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(AirportWaveSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/context/hotspot",
    tags: [
        "Context"
    ],
    summary: "Get zone hotspot popularity",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            zone_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid().optional(),
            bucket: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    },
    responses: {
        200: {
            description: "Hotspot data",
            content: {
                "application/json": {
                    schema: DataResponseSchema(HotspotSchema.nullable())
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Recommendations
registry.registerPath({
    method: "get",
    path: "/api/recommendations/next-spot",
    tags: [
        "Recommendations"
    ],
    summary: "Get top recommended zones with ETA and distance",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        query: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
            lon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
            limit: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
        })
    },
    responses: {
        200: {
            description: "Recommended zones with scores, distance, and ETA",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(RecommendationSchema))
                }
            }
        },
        400: {
            description: "Missing or invalid coordinates",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Driver State
registry.registerPath({
    method: "get",
    path: "/api/driver-state",
    tags: [
        "Tracking"
    ],
    summary: "Get current driver state and cached recommendations",
    security: [
        {
            bearerAuth: []
        }
    ],
    responses: {
        200: {
            description: "Current driver state",
            content: {
                "application/json": {
                    schema: DataResponseSchema(DriverStateSchema)
                }
            }
        },
        204: {
            description: "No state available (new driver)"
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Admin - Zones
registry.registerPath({
    method: "post",
    path: "/api/admin/zones",
    tags: [
        "Admin"
    ],
    summary: "Create a zone (admin only)",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AdminZoneReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Zone created",
            content: {
                "application/json": {
                    schema: CreatedResponseSchema
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        403: {
            description: "Forbidden - admin only",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "get",
    path: "/api/admin/zones",
    tags: [
        "Admin"
    ],
    summary: "List all zones (admin)",
    security: [
        {
            bearerAuth: []
        }
    ],
    responses: {
        200: {
            description: "List of zones",
            content: {
                "application/json": {
                    schema: DataResponseSchema(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(ZoneSchema))
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        403: {
            description: "Forbidden - admin only",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "patch",
    path: "/api/admin/zones/{id}",
    tags: [
        "Admin"
    ],
    summary: "Update a zone (admin only)",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        params: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: AdminZoneReq.partial()
                }
            }
        }
    },
    responses: {
        200: {
            description: "Zone updated",
            content: {
                "application/json": {
                    schema: DataResponseSchema(ZoneSchema)
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        403: {
            description: "Forbidden - admin only",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
// Admin - Events
registry.registerPath({
    method: "post",
    path: "/api/admin/events",
    tags: [
        "Admin"
    ],
    summary: "Create a city event (admin only)",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: AdminEventReq
                }
            }
        }
    },
    responses: {
        201: {
            description: "Event created",
            content: {
                "application/json": {
                    schema: CreatedResponseSchema
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        403: {
            description: "Forbidden - admin only",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
registry.registerPath({
    method: "patch",
    path: "/api/admin/events/{id}",
    tags: [
        "Admin"
    ],
    summary: "Update a city event (admin only)",
    security: [
        {
            bearerAuth: []
        }
    ],
    request: {
        params: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
            id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().uuid()
        }),
        body: {
            content: {
                "application/json": {
                    schema: AdminEventReq.partial()
                }
            }
        }
    },
    responses: {
        200: {
            description: "Event updated",
            content: {
                "application/json": {
                    schema: DataResponseSchema(CityEventSchema)
                }
            }
        },
        400: {
            description: "Validation error",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        401: {
            description: "Unauthorized",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        403: {
            description: "Forbidden - admin only",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        },
        404: {
            description: "Not found",
            content: {
                "application/json": {
                    schema: ApiErrorSchema
                }
            }
        }
    }
});
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
"[project]/lib/server/ride-event-ingest.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ingestRideEvent",
    ()=>ingestRideEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/geo-utils.ts [app-route] (ecmascript)");
;
const ZONE_SNAP_RADIUS_M = 3000;
async function ingestRideEvent({ supabase, driverId, payload }) {
    const occurredAt = payload.occurred_at ? new Date(payload.occurred_at).toISOString() : new Date().toISOString();
    const hasPickup = typeof payload.pickup_lat === "number" && typeof payload.pickup_lon === "number" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLatitude"])(payload.pickup_lat) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLongitude"])(payload.pickup_lon);
    const hasDrop = typeof payload.drop_lat === "number" && typeof payload.drop_lon === "number" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLatitude"])(payload.drop_lat) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isValidLongitude"])(payload.drop_lon);
    const [pickupZoneId, dropZoneId] = await Promise.all([
        hasPickup ? snapZoneId(supabase, payload.pickup_lat, payload.pickup_lon) : Promise.resolve(null),
        hasDrop ? snapZoneId(supabase, payload.drop_lat, payload.drop_lon) : Promise.resolve(null)
    ]);
    const insertPayload = {
        driver_id: driverId,
        event_type: payload.event_type,
        occurred_at: occurredAt,
        platform: payload.platform ?? null,
        surge_multiplier: payload.surge_multiplier ?? null,
        promo_code: payload.promo_code ?? null,
        cancel_reason: payload.event_type === "booking_cancelled" ? payload.cancel_reason ?? null : null,
        deadhead_distance_km: payload.deadhead_distance_km ?? null,
        deadhead_time_min: payload.deadhead_time_min ?? null,
        pickup_zone: pickupZoneId,
        drop_zone: dropZoneId,
        pickup_loc: hasPickup ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pointFromLatLon"])(payload.pickup_lat, payload.pickup_lon) : null,
        drop_loc: hasDrop ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$geo$2d$utils$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pointFromLatLon"])(payload.drop_lat, payload.drop_lon) : null
    };
    const { data, error } = await supabase.from("ride_events").insert(insertPayload).select("id").single();
    if (error) {
        throw error;
    }
    if (payload.event_type === "ride_completed") {
        try {
            await supabase.rpc("upsert_trip_from_events", {
                p_driver_id: driverId,
                p_platform: payload.platform ?? null,
                p_fare_inr: payload.fare_inr ?? null,
                p_distance_km: payload.distance_km ?? null,
                p_pickup_zone: pickupZoneId,
                p_drop_zone: dropZoneId,
                p_completed_at: occurredAt,
                p_event_id: data?.id ?? null,
                p_deadhead_distance_km: payload.deadhead_distance_km ?? null,
                p_deadhead_time_min: payload.deadhead_time_min ?? null
            });
        } catch (rpcError) {
            console.error("[ride-events] upsert_trip_from_events failed", {
                driverId,
                rpcError
            });
        }
    }
    return {
        eventId: data.id,
        pickupZoneId,
        dropZoneId,
        occurredAt
    };
}
async function snapZoneId(supabase, lat, lon) {
    const { data, error } = await supabase.rpc("nearest_zone", {
        p_lat: lat,
        p_lon: lon,
        p_max_m: ZONE_SNAP_RADIUS_M
    });
    if (error) {
        console.error("[ride-events] nearest_zone failed", {
            error
        });
        return null;
    }
    return typeof data === "number" ? data : null;
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
"[project]/app/api/ride-events/ingest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$zod$2d$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/zod-schemas.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$ride$2d$event$2d$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/server/ride-event-ingest.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
;
;
;
;
;
async function POST(req) {
    const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
    if (!user) {
        return Response.json({
            error: {
                code: "UNAUTHENTICATED",
                message: "Please sign in"
            }
        }, {
            status: 401
        });
    }
    let body = null;
    try {
        body = await req.json();
    } catch (error) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Request body must be valid JSON", serializeError(error), 400, "INVALID_JSON");
    }
    const logContext = {
        userId: user.id
    };
    try {
        const payload = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$zod$2d$schemas$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["RideEventIngestSchema"].parse(body);
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$server$2f$ride$2d$event$2d$ingest$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ingestRideEvent"])({
            supabase,
            driverId: user.id,
            payload
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            ok: true,
            event_id: result.eventId,
            pickup_zone: result.pickupZoneId,
            drop_zone: result.dropZoneId,
            occurred_at: result.occurredAt
        });
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].ZodError) {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Invalid input", error.flatten(), 400, "INVALID_INPUT");
        }
        if (isPostgrestError(error)) {
            console.error("[ride-events/ingest] DB error", {
                ...logContext,
                payload: body,
                error
            });
            return Response.json({
                error: {
                    code: "DB_ERROR",
                    message: "Failed to insert ride event",
                    details: formatPostgrestError(error)
                }
            }, {
                status: 500
            });
        }
        console.error("[ride-events/ingest] failed", {
            ...logContext,
            payload: body,
            error
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])(error instanceof Error ? error.message : "Unexpected error", serializeError(error), 500, "INTERNAL_ERROR");
    }
}
function serializeError(error) {
    if (!error) {
        return null;
    }
    if (error instanceof Error) {
        const extras = typeof error === "object" ? Object.fromEntries(Object.entries(error)) : {};
        return {
            name: error.name,
            message: error.message,
            ...error.stack ? {
                stack: error.stack
            } : {},
            ...extras
        };
    }
    if (typeof error === "object") {
        return error;
    }
    return {
        message: String(error)
    };
}
function isPostgrestError(error) {
    return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" && "message" in error;
}
function formatPostgrestError(error) {
    return {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
        hint: error.hint ?? null
    };
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__dcbee76c._.js.map