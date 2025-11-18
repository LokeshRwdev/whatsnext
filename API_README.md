# Patna EV Co-Pilot REST API

Complete REST API layer with Swagger documentation for the Patna EV Co-Pilot driver assistance application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Ensure `.env.local` contains:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access API Documentation
Open **http://localhost:3000/api/docs** in your browser to view the interactive Swagger UI.

## 📚 API Endpoints

### System
- **GET** `/api/health` - Health check (no auth required)
- **GET** `/api/openapi` - OpenAPI 3.1 JSON spec (no auth required)
- **GET** `/api/docs` - Swagger UI documentation page (no auth required)

### Zones
- **GET** `/api/zones` - List all zones (auth required)
- **POST** `/api/admin/zones` - Create zone (admin only)
- **GET** `/api/admin/zones` - List all zones (admin only)
- **PATCH** `/api/admin/zones/{id}` - Update zone (admin only)

### Ride Events
- **POST** `/api/ride-events` - Create ride event (booking_received, ride_started, ride_completed, booking_cancelled)
- **GET** `/api/ride-events` - List own ride events with optional `?limit=N` query param
- **GET** `/api/ride-events/{id}` - Get single ride event by ID

### Zone Visits
- **POST** `/api/zone-visits` - Create zone visit (track when driver enters a zone)
- **GET** `/api/zone-visits` - List own zone visits
- **PATCH** `/api/zone-visits/{id}` - Update zone visit left_at timestamp

### Tracking
- **POST** `/api/pings` - Submit GPS ping and receive zone recommendations (Live Tracking)
- **GET** `/api/pings` - List recent pings (limit 200)
- **GET** `/api/driver-state` - Get current driver state with cached recommendations

### Charges
- **POST** `/api/charges` - Create charge record
- **GET** `/api/charges` - List own charging sessions

### Context Data
- **GET** `/api/context/weather` - Get latest weather observation
- **GET** `/api/context/airport-wave` - Get current hour airport arrival/departure waves
- **GET** `/api/context/hotspot` - Get zone popularity by zone_id and/or bucket

### Recommendations
- **GET** `/api/recommendations/next-spot` - Get top 3 recommended zones with distance, ETA, and scoring

### Live Tracking System
See **[LIVE_TRACKING.md](./LIVE_TRACKING.md)** for complete documentation on:
- GPS ping submission with automatic zone snapping
- Real-time recommendation computation
- Driver state management
- Scoring algorithm details
- Testing and troubleshooting

### Admin - City Events
- **POST** `/api/admin/events` - Create city event (admin only)
- **PATCH** `/api/admin/events/{id}` - Update city event (admin only)

## 🔐 Authentication

All endpoints (except `/api/health`, `/api/openapi`, and `/api/docs`) require authentication via Supabase JWT token.

### How to Authenticate

Include the Supabase session token in the `Authorization` header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Token from Supabase Client

```typescript
import { supabaseBrowser } from "@/lib/supabase-browser";

const { data: { session } } = await supabaseBrowser.auth.getSession();
const token = session?.access_token;

// Use in fetch
const response = await fetch("/api/ride-events", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    event_type: "booking_received",
    lat: 25.5941,
    lon: 85.1376,
    battery_pct: 65,
  }),
});
```

## 📝 Request/Response Format

### Success Response
All successful responses follow this format:
```json
{
  "data": { /* your data here */ }
}
```

### Error Response
All error responses follow this format:
```json
{
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Validation error / Bad request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (admin-only endpoint accessed by non-admin)
- `404` - Not found
- `500` - Internal server error

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "data": {
    "ok": true,
    "time": "2025-11-09T06:30:00.000Z"
  }
}
```

### 2. Create Ride Event (requires auth)
```bash
curl -X POST http://localhost:3000/api/ride-events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "booking_received",
    "lat": 25.5941,
    "lon": 85.1376,
    "battery_pct": 65
  }'
```

Response:
```json
{
  "data": {
    "created": true
  }
}
```

### 3. List Zones (requires auth)
```bash
curl http://localhost:3000/api/zones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Patna Junction",
      "geohash6": "tuvz6y",
      "is_airport": false,
      "is_charger": false
    },
    ...
  ]
}
```

### 4. Get Recommendations (requires auth)
```bash
curl "http://localhost:3000/api/recommendations/next-spot?lat=25.5941&lon=85.1376" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "data": [
    {
      "zone_id": "550e8400-e29b-41d4-a716-446655440000",
      "zone_name": "Patna Airport",
      "score": 0.85,
      "reason": "85% success rate, airport corridor"
    },
    ...
  ]
}
```

## 🛡️ Security Model

### Row-Level Security (RLS)
All database operations respect Supabase RLS policies:
- Drivers can only read/write their own data
- `driver_id` is automatically set to `auth.uid()` on insert (never from client)
- Admin endpoints check `profiles.is_admin = true`

### Rate Limiting
A simple in-memory rate limiter is available in `lib/ratelimit.ts`:
```typescript
import { rateLimit } from "@/lib/ratelimit";

const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
const { allowed, remaining } = rateLimit(ip, 60, 60000); // 60 req/min

if (!allowed) {
  return bad("Rate limit exceeded", { remaining }, 429);
}
```

Apply to write endpoints as needed.

## 📖 OpenAPI Specification

### Runtime Generation
The OpenAPI spec is generated at runtime from Zod schemas with full type safety:
- **GET** `/api/openapi` - Returns the complete OpenAPI 3.1 JSON document
- All request/response schemas are validated with Zod
- Automatic type inference for TypeScript consumers

### Static Export (Optional)
Generate a static `public/openapi.json` file:
```bash
npm run openapi:emit
```

This creates a static file that can be:
- Committed to version control
- Used by API clients/SDKs
- Imported into Postman/Insomnia

## 🏗️ Architecture

### File Structure
```
app/api/
  ├── health/route.ts              # Health check
  ├── openapi/route.ts             # OpenAPI JSON spec
  ├── docs/page.tsx                # Swagger UI page
  ├── zones/route.ts               # Zones list
  ├── ride-events/
  │   ├── route.ts                 # POST create, GET list
  │   └── [id]/route.ts            # GET single
  ├── zone-visits/
  │   ├── route.ts                 # POST create, GET list
  │   └── [id]/route.ts            # PATCH update
  ├── pings/route.ts               # POST GPS pings
  ├── charges/route.ts             # POST create, GET list
  ├── context/
  │   ├── weather/route.ts         # GET weather
  │   ├── airport-wave/route.ts    # GET airport data
  │   └── hotspot/route.ts         # GET popularity
  ├── recommendations/
  │   └── next-spot/route.ts       # GET recommendations
  └── admin/
      ├── zones/
      │   ├── route.ts             # POST create, GET list
      │   └── [id]/route.ts        # PATCH update
      └── events/
          ├── route.ts             # POST create
          └── [id]/route.ts        # PATCH update

lib/
  ├── api-respond.ts               # ok() and bad() helpers
  ├── auth-guard.ts                # requireUser() and requireAdmin()
  ├── ratelimit.ts                 # Rate limiter
  ├── zod-schemas.ts               # All Zod schemas + OpenAPI registration
  └── openapi.ts                   # OpenAPI document builder

scripts/
  └── emit-openapi.mjs             # Static OpenAPI JSON generator
```

### Key Modules

#### `lib/api-respond.ts`
Uniform response helpers:
```typescript
ok(data, status = 200)    // Success response
bad(msg, details, status) // Error response
```

#### `lib/auth-guard.ts`
Authentication helpers:
```typescript
requireUser(req)    // Returns { supabase, user } or throws "Unauthorized"
requireAdmin(req)   // Checks is_admin flag, throws "Forbidden" if not admin
```

#### `lib/zod-schemas.ts`
All request/response schemas with OpenAPI registration:
- Entity schemas: `ZoneSchema`, `RideEventSchema`, etc.
- Request schemas: `CreateRideEventReq`, `CreateZoneVisitReq`, etc.
- OpenAPI registry with all paths and components

#### `lib/openapi.ts`
Generates OpenAPI 3.1 document from Zod schemas at runtime.

## 🔧 Advanced Usage

### Calling Internal RPCs
Some endpoints use Supabase RPCs for complex operations:

```typescript
// Ride events use ingest_ride_event RPC
const { error } = await supabase.rpc("ingest_ride_event", {
  p_event_type: "booking_received",
  p_occurred_at: new Date().toISOString(),
  p_lat: 25.5941,
  p_lon: 85.1376,
  p_battery_pct: 65,
});
```

### PostGIS Queries
Pings and zones use PostGIS for geospatial data:
```typescript
// Insert ping with location
await supabase.rpc("exec_sql", {
  sql: `INSERT INTO pings (driver_id, ts, loc) 
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326))`,
  params: [userId, timestamp, lon, lat],
});
```

## 📋 Quality Checklist

- ✅ All endpoints have Zod validation
- ✅ All routes return uniform `{ data }` or `{ error }` format
- ✅ Swagger UI at `/api/docs` with full documentation
- ✅ OpenAPI 3.1 spec at `/api/openapi`
- ✅ Bearer auth required for all protected routes
- ✅ RLS enforced via Supabase auth context
- ✅ Admin routes check `is_admin` flag
- ✅ Rate limiter available for write endpoints
- ✅ TypeScript types inferred from Zod schemas
- ✅ Error handling with try/catch and status codes

## 🚦 Next Steps

1. **Test with Supabase**: Set up your Supabase project and apply the schema from `supabase/schema.sql`
2. **Get Auth Token**: Use magic link login at `/login` to get a valid session
3. **Try Swagger UI**: Visit `/api/docs` and authenticate with Bearer token
4. **Create Data**: POST to `/api/ride-events`, `/api/zone-visits`, etc.
5. **Check Recommendations**: GET `/api/recommendations/next-spot` after creating training data

## 📞 Support

For issues or questions:
- Check TypeScript errors: All Zod schemas are fully typed
- Review RLS policies: Ensure `profiles.is_admin` is set for admin access
- Monitor network tab: Check request/response format and status codes
- Use Swagger UI: Interactive testing with automatic request formatting
