module.exports = [
"[project]/lib/supabase-browser.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-ssr] (ecmascript) <locals>");
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://spqlnfacobphbttgptdv.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcWxuZmFjb2JwaGJ0dGdwdGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDQ5MTIsImV4cCI6MjA3ODIyMDkxMn0.5yC-IL2q7mhXJBf1RGFqfSeSqYNE8mRMVe77Sw9I7yg"), {
    auth: {
        persistSession: true,
        autoRefreshToken: true
    }
});
}),
"[project]/lib/offline-queue.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "drain",
    ()=>drain,
    "enqueue",
    ()=>enqueue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-ssr] (ecmascript)");
;
const DB = "ride-db";
const STORE = "events";
async function db() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openDB"])(DB, 1, {
        upgrade (d) {
            d.createObjectStore(STORE, {
                keyPath: "id",
                autoIncrement: true
            });
        }
    });
}
async function enqueue(e) {
    (await db()).add(STORE, {
        ...e,
        created_at: Date.now()
    });
}
async function drain(flush) {
    const d = await db();
    const tx = d.transaction(STORE, "readwrite");
    const s = tx.store;
    let c = await s.openCursor();
    while(c){
        const ok = await flush(c.value);
        if (ok) await c.delete();
        c = await c.continue();
    }
    await tx.done;
}
}),
"[project]/components/RideConfirmBar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RideConfirmBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2d$browser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase-browser.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$offline$2d$queue$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/offline-queue.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
async function getCoords() {
    return new Promise((res, rej)=>navigator.geolocation.getCurrentPosition(res, rej, {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        })).then((p)=>({
            lat: p.coords.latitude,
            lon: p.coords.longitude
        })).catch(()=>({
            lat: null,
            lon: null
        }));
}
async function sendEvent(payload) {
    const token = (await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2d$browser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].auth.getSession()).data.session?.access_token;
    const r = await fetch("/functions/v1/ingest_ride_event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });
    return r.ok;
}
function RideConfirmBar() {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("seeking");
    const [battery, setBattery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        navigator.serviceWorker?.addEventListener("message", (e)=>{
            if (e.data?.type === "SYNC_REQUEST") {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$offline$2d$queue$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["drain"])(sendEvent);
            }
        });
    }, []);
    async function post(type) {
        setStatus("Locating…");
        const coords = await getCoords();
        const payload = {
            event_type: type,
            occurred_at: new Date().toISOString(),
            battery_pct: battery ? Number(battery) : null,
            ...coords
        };
        setStatus("Saving…");
        const ok = await sendEvent(payload);
        if (!ok) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$offline$2d$queue$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["enqueue"])(payload);
            const reg = await navigator.serviceWorker?.ready;
            await reg?.sync.register("flush-ride-queue");
            setStatus("Saved offline");
        } else {
            setStatus("Saved");
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-md mx-auto space-y-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    className: "w-full border rounded p-2",
                    placeholder: "Battery % (optional)",
                    value: battery,
                    onChange: (e)=>setBattery(e.target.value)
                }, void 0, false, {
                    fileName: "[project]/components/RideConfirmBar.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm text-gray-600",
                    children: status || (state === "seeking" ? "Seeking rides…" : state === "booked" ? "Booking confirmed" : "On a trip")
                }, void 0, false, {
                    fileName: "[project]/components/RideConfirmBar.tsx",
                    lineNumber: 77,
                    columnNumber: 9
                }, this),
                state === "seeking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "w-full bg-emerald-600 text-white rounded p-4 text-lg",
                    onClick: async ()=>{
                        await post("booking_received");
                        setState("booked");
                    },
                    children: "Got a ride"
                }, void 0, false, {
                    fileName: "[project]/components/RideConfirmBar.tsx",
                    lineNumber: 81,
                    columnNumber: 11
                }, this),
                state === "booked" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "bg-emerald-600 text-white rounded p-4",
                            onClick: async ()=>{
                                await post("ride_started");
                                setState("ontrip");
                            },
                            children: "Start trip"
                        }, void 0, false, {
                            fileName: "[project]/components/RideConfirmBar.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "border rounded p-4",
                            onClick: async ()=>{
                                await post("booking_cancelled");
                                setState("seeking");
                            },
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/components/RideConfirmBar.tsx",
                            lineNumber: 102,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/RideConfirmBar.tsx",
                    lineNumber: 92,
                    columnNumber: 11
                }, this),
                state === "ontrip" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "w-full bg-emerald-600 text-white rounded p-4 text-lg",
                    onClick: async ()=>{
                        await post("ride_completed");
                        setState("seeking");
                    },
                    children: "End trip"
                }, void 0, false, {
                    fileName: "[project]/components/RideConfirmBar.tsx",
                    lineNumber: 114,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/RideConfirmBar.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/RideConfirmBar.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_dc4be6e5._.js.map