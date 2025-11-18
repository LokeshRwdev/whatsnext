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
"[project]/lib/auth-guard.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getSupabaseFromRequest",
    ()=>getSupabaseFromRequest,
    "requireAdmin",
    ()=>requireAdmin,
    "requireUser",
    ()=>requireUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
;
;
function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(";");
    const prefix = `${name}=`;
    for (const part of parts){
        const trimmed = part.trim();
        if (trimmed.startsWith(prefix)) {
            return decodeURIComponent(trimmed.substring(prefix.length));
        }
    }
    return null;
}
function extractAccessToken(req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.substring(7).trim();
    }
    const cookieHeader = req.headers.get("cookie");
    const cookieToken = getCookieValue(cookieHeader, "sb-access-token") ?? getCookieValue(cookieHeader, "sb:token");
    return cookieToken ?? null;
}
async function getSupabaseFromRequest(req) {
    const url = ("TURBOPACK compile-time value", "https://spqlnfacobphbttgptdv.supabase.co");
    const key = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcWxuZmFjb2JwaGJ0dGdwdGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDQ5MTIsImV4cCI6MjA3ODIyMDkxMn0.5yC-IL2q7mhXJBf1RGFqfSeSqYNE8mRMVe77Sw9I7yg");
    const accessToken = extractAccessToken(req);
    const headers = {};
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, key, {
        auth: {
            persistSession: false,
            detectSessionInUrl: false
        },
        global: {
            headers
        }
    });
    const { data: { user }, error } = await supabase.auth.getUser(accessToken ?? undefined);
    if (error) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](401, "UNAUTHORIZED", "Not authenticated", error);
    }
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](401, "UNAUTHORIZED", "Not authenticated");
    }
    return {
        supabase,
        user
    };
}
async function requireUser(req) {
    const { supabase, user } = await getSupabaseFromRequest(req);
    if (!user) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](401, "UNAUTHORIZED", "Not authenticated");
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
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["HttpError"](403, "FORBIDDEN", "Admin access required", error);
    }
    return {
        supabase,
        user
    };
}
}),
"[project]/app/api/driver-state/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-guard.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api-respond.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const { supabase, user } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$guard$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requireUser"])(req);
        const { data, error } = await supabase.from("driver_state").select("driver_id,last_ping_at,lat,lon,snapped_zone_id,speed_kmh,battery_pct,recommendation,updated_at").eq("driver_id", user.id).maybeSingle();
        if (error && error.code !== "PGRST116") {
            console.error("[driver-state] fetch failed", {
                driverId: user.id,
                error
            });
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Failed to fetch driver state", null, 500, "DB_ERROR");
        }
        if (!data) {
            return new Response(null, {
                status: 204
            });
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ok"])({
            driver_id: data.driver_id,
            last_ping_at: data.last_ping_at,
            snapped_zone: data.snapped_zone_id,
            snapped_zone_id: data.snapped_zone_id,
            lat: data.lat,
            lon: data.lon,
            speed_kmh: data.speed_kmh,
            battery_pct: data.battery_pct,
            recommendation: data.recommendation,
            updated_at: data.updated_at
        });
    } catch (error) {
        if (error.message === "Unauthorized") {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Unauthorized", null, 401, "UNAUTHORIZED");
        }
        console.error("[driver-state] unexpected error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2d$respond$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["bad"])("Unexpected error", null, 500, "INTERNAL_ERROR");
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7de204c2._.js.map