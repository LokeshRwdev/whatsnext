# 📍 Live Tracking & Recommendations API

Complete server-side implementation for real-time GPS tracking and intelligent zone recommendations in the Patna EV Co-Pilot.

## Overview

The Live Tracking system processes foreground GPS pings, snaps locations to zones, computes personalized Top-3 zone recommendations, and maintains driver state for seamless polling.

### Key Features

- ✅ **Real-time GPS Processing**: Submit pings with automatic zone snapping (3km radius)
- ✅ **Smart Recommendations**: Deterministic heuristic scoring (success rate + proximity + context + priority)
- ✅ **Driver State Management**: Persistent state with cached recommendations
- ✅ **Rate Limiting**: 1 req/sec per user, 60 req/min per IP
- ✅ **RLS Security**: All operations enforce Row-Level Security via Supabase auth
- ✅ **Optional Realtime**: Broadcast recommendations via Supabase Realtime (feature flag)

## Architecture

```
Client GPS Ping
    ↓
POST /api/pings
    ↓
Validate & Insert Ping (RLS)
    ↓
Snap to Nearest Zone (PostGIS)
    ↓
Compute Recommendations (Heuristic Engine)
    ↓
Upsert driver_state
    ↓
[Optional] Broadcast via Realtime
    ↓
Return { snapped_zone_id, recommendation }
```

## Endpoints

### 1. Submit GPS Ping

**POST** `/api/pings`

Submit a GPS ping, receive zone snapping and Top-3 recommendations.

#### Request Headers
```
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json
```

#### Request Body
```json
{
  "lat": 25.5941,
  "lon": 85.1376,
  "ts": "2025-11-10T10:30:00.000Z",  // optional, defaults to now
  "speed_kmh": 25.5,                 // optional
  "battery_pct": 78                  // optional
}
```

**Validation Rules:**
- `lat`: -90 to 90
- `lon`: -180 to 180
- `speed_kmh`: 0 to 200 (if provided)
- `battery_pct`: 0 to 100 (if provided)
- Rate limit: 1 req/sec per user, 60 req/min per IP

#### Response (201 Created)
```json
{
  "data": {
    "snapped_zone_id": "550e8400-e29b-41d4-a716-446655440000",
    "recommendation": [
      {
        "zone_id": "550e8400-e29b-41d4-a716-446655440001",
        "zone_name": "Gandhi Maidan",
        "score": 0.87,
        "distance_km": 2.3,
        "eta_min": 8,
        "reason": "82% success rate, nearby, high demand"
      },
      {
        "zone_id": "550e8400-e29b-41d4-a716-446655440002",
        "zone_name": "Patna Junction",
        "score": 0.75,
        "distance_km": 3.1,
        "eta_min": 11,
        "reason": "75% success rate, major event nearby"
      },
      {
        "zone_id": "550e8400-e29b-41d4-a716-446655440003",
        "zone_name": "Airport Road",
        "score": 0.68,
        "distance_km": 5.2,
        "eta_min": 15,
        "reason": "68% success rate, airport corridor, flight arrivals"
      }
    ]
  }
}
```

#### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "lat": ["Number must be greater than or equal to -90"]
    }
  }
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": "Unauthorized",
  "details": null
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Rate limit exceeded",
  "details": {
    "limit": "1 req/sec"
  }
}
```

---

### 2. Get Recommendations

**GET** `/api/recommendations/next-spot`

Retrieve Top-N zone recommendations based on current or last-known location.

#### Query Parameters
- `lat` (optional): Current latitude
- `lon` (optional): Current longitude
- `limit` (optional): Number of recommendations (default: 3, max: 10)

**Note:** If `lat`/`lon` are omitted, uses last location from `driver_state`.

#### Request Headers
```
Authorization: Bearer <supabase-jwt-token>
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "zone_id": "550e8400-e29b-41d4-a716-446655440001",
      "zone_name": "Gandhi Maidan",
      "score": 0.87,
      "distance_km": 2.3,
      "eta_min": 8,
      "reason": "82% success rate, nearby, high demand"
    },
    {
      "zone_id": "550e8400-e29b-41d4-a716-446655440002",
      "zone_name": "Boring Road",
      "score": 0.72,
      "distance_km": 1.5,
      "eta_min": 6,
      "reason": "very close, charging available"
    }
  ]
}
```

#### Error Responses

**400 Bad Request** - No location data
```json
{
  "error": "No location data available",
  "details": {
    "hint": "Send a ping first or provide lat/lon query params"
  }
}
```

---

### 3. Get Driver State

**GET** `/api/driver-state`

Retrieve current driver state including last ping, location, and cached recommendations.

#### Request Headers
```
Authorization: Bearer <supabase-jwt-token>
```

#### Response (200 OK)
```json
{
  "data": {
    "driver_id": "auth-user-uuid",
    "last_ping_at": "2025-11-10T10:30:15.000Z",
    "lat": 25.5941,
    "lon": 85.1376,
    "snapped_zone_id": "550e8400-e29b-41d4-a716-446655440000",
    "speed_kmh": 25.5,
    "battery_pct": 78,
    "recommendation": [
      {
        "zone_id": "550e8400-e29b-41d4-a716-446655440001",
        "zone_name": "Gandhi Maidan",
        "score": 0.87,
        "distance_km": 2.3,
        "eta_min": 8,
        "reason": "82% success rate, nearby, high demand"
      }
    ],
    "updated_at": "2025-11-10T10:30:15.500Z"
  }
}
```

#### Response (204 No Content)
Returns empty response if driver has never submitted a ping.

---

## Recommendation Scoring

The system uses a **deterministic heuristic** that will be replaced by ML models in the future.

### Scoring Formula

```
Final Score = 0.4 × successRate + 0.3 × proximityScore + 0.2 × contextScore + 0.1 × priorityBonus
```

#### Components

1. **Success Rate (40%)** - Historical booking/ride conversion
   - Rolling 14-day window
   - Filtered by current hour and day of week
   - Minimum baseline: 30%

2. **Proximity Score (30%)** - Inverse distance normalized
   - Distance < 0.5km: 1.0 (very close)
   - Distance > 10km: 0.0 (too far)
   - Linear decay between

3. **Context Score (20%)** - Real-time demand signals
   - Hotspot popularity (current 30-min bucket)
   - Airport wave (arrival/departure activity)
   - Active city events (within 3 hours)

4. **Priority Bonus (10%)** - Zone attributes
   - Airport zones: +0.5
   - Charger zones (battery-dependent):
     - Battery < 20%: +0.8
     - Battery < 40%: +0.4
     - Otherwise: +0.1

### Tie-Breaking
When scores are equal (within 0.01), closer zones rank higher.

### Filtering
- Excludes current snapped zone (unless only option)
- Returns Top-N (configurable, default 3)

---

## Database Schema

### `driver_state` Table

```sql
CREATE TABLE public.driver_state (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_ping_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (...) STORED,
  snapped_zone_id INTEGER REFERENCES public.zones(id),
  speed_kmh DOUBLE PRECISION,
  battery_pct SMALLINT CHECK (battery_pct >= 0 AND battery_pct <= 100),
  recommendation JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies:**
- Drivers can SELECT/INSERT/UPDATE only their own row
- `auth.uid() = driver_id` enforced

**Indexes:**
- GiST index on `geom` for spatial queries
- B-tree on `updated_at` for stale state cleanup
- B-tree on `snapped_zone_id` for joins

---

## Testing Guide

### Prerequisites
1. Supabase project running
2. Schema applied: `supabase db reset` or manually run `schema.sql`
3. Valid auth token from `/login`

### PowerShell Examples

#### 1. Submit a Ping
```powershell
$token = "your-supabase-jwt-token"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    lat = 25.5941
    lon = 85.1376
    speed_kmh = 25.5
    battery_pct = 78
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/pings" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json
```

**Expected:**
```json
{
  "data": {
    "snapped_zone_id": "...",
    "recommendation": [...]
  }
}
```

#### 2. Get Recommendations (with location)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot?lat=25.5941&lon=85.1376&limit=3" `
    -Headers $headers | ConvertFrom-Json
```

#### 3. Get Recommendations (from cached state)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot" `
    -Headers $headers | ConvertFrom-Json
```

#### 4. Get Driver State
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/driver-state" `
    -Headers $headers | ConvertFrom-Json
```

### cURL Examples

#### Submit Ping
```bash
curl -X POST http://localhost:3000/api/pings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 25.5941,
    "lon": 85.1376,
    "speed_kmh": 25.5,
    "battery_pct": 78
  }'
```

#### Get Recommendations
```bash
curl "http://localhost:3000/api/recommendations/next-spot?lat=25.5941&lon=85.1376" \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Driver State
```bash
curl http://localhost:3000/api/driver-state \
  -H "Authorization: Bearer $TOKEN"
```

---

## Error Handling

### Standard Error Format
```json
{
  "error": "Human-readable message",
  "details": {
    "code": "ERROR_CODE",
    ...additional context
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `RATE_LIMIT` | 429 | Too many requests |
| `DB_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Optional Realtime Broadcasting

Enable live recommendation updates via Supabase Realtime.

### Setup

1. **Enable in Environment**
```env
ENABLE_REALTIME_BROADCAST=true
```

2. **Subscribe on Client**
```typescript
const channel = supabase.channel(`recs:driver_${userId}`)
  .on('broadcast', { event: 'recommendation_update' }, (payload) => {
    console.log('New recommendations:', payload.recommendations);
  })
  .subscribe();
```

3. **Unsubscribe on Cleanup**
```typescript
channel.unsubscribe();
```

**Note:** Realtime is **disabled by default**. Only enable if needed to reduce server load.

---

## Performance & Scalability

### Rate Limits
- **Per User:** 1 ping/second
- **Per IP:** 60 requests/minute
- **Recommendation Queries:** Unlimited (read-only)

### Database Optimization
- Spatial indexes on `geom` columns for fast zone lookups
- Training data queries limited to 14-day rolling window
- Context data (hotspots, airport waves) cached at 30-min buckets

### Future Enhancements
- [ ] Replace heuristic with ML model/bandit
- [ ] Add Redis caching for hot zones
- [ ] Implement WebSocket streaming for continuous updates
- [ ] Add geofencing alerts for zone entry/exit

---

## Security Checklist

- ✅ All endpoints require authentication (`requireUser`)
- ✅ RLS policies enforce `driver_id = auth.uid()`
- ✅ Input validation with Zod schemas
- ✅ Coordinate bounds checking
- ✅ Rate limiting (user + IP)
- ✅ Content-Type validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Minimal error details in responses
- ✅ Server-side computations only (no client-side geo math)

---

## Troubleshooting

### Issue: "No location data available"
**Solution:** Submit a ping first via `POST /api/pings` or provide `lat`/`lon` query params.

### Issue: "Rate limit exceeded"
**Solution:** Wait 1 second between pings. Check IP-based limit (60/min).

### Issue: Empty recommendations array
**Possible Causes:**
1. No zones within 10km
2. No training data for current time window
3. All nearby zones filtered out

**Check:**
```sql
SELECT COUNT(*) FROM zones;
SELECT COUNT(*) FROM training_examples WHERE hour_of_day = EXTRACT(HOUR FROM NOW());
```

### Issue: "DB_ERROR" on ping submission
**Check RLS Policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'pings';
SELECT * FROM pg_policies WHERE tablename = 'driver_state';
```

---

## API Reference Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/pings` | Required | Submit GPS ping, get recommendations |
| GET | `/api/pings` | Required | List recent pings (limit 200) |
| GET | `/api/recommendations/next-spot` | Required | Get Top-N zone recommendations |
| GET | `/api/driver-state` | Required | Get current driver state |

**OpenAPI Spec:** Visit `/api/docs` or `/api/openapi` for interactive documentation.

---

## Development Notes

### File Structure
```
lib/server/
  ├── geo-utils.ts       # Haversine, ETA, coordinate validation
  ├── recommend.ts       # Heuristic scoring engine
app/api/
  ├── pings/route.ts     # GPS ping processing
  ├── recommendations/
  │   └── next-spot/route.ts  # Recommendation queries
  └── driver-state/route.ts   # State management
supabase/
  └── schema.sql         # Database schema with RLS
```

### Adding Context Data Sources

To incorporate new signals (e.g., weather, traffic):

1. **Add table query in `recommend.ts`:**
```typescript
const { data: weatherData } = await supabase
  .from('weather_obs')
  .select('temp_c,rain_mm')
  .single();
```

2. **Update scoring formula:**
```typescript
const weatherScore = calculateWeatherImpact(weatherData);
const contextScore = (hotspot + airportWave + eventImpact + weatherScore) / 4;
```

3. **Document in reason string:**
```typescript
if (weatherData.rain_mm > 5) {
  reasons.push('expect rain delays');
}
```

---

## Support

For issues or feature requests:
1. Check the troubleshooting section
2. Review error logs: `console.error` output in server logs
3. Verify RLS policies: Query `pg_policies` view
4. Test with cURL/Postman before client integration

**Next Steps:** See `API_README.md` for full API documentation and `API_TESTING_GUIDE.md` for comprehensive test scenarios.
