# Live Tracking API Quick Reference

## Base URL
```
http://localhost:3000  (development)
```

## Authentication
All endpoints require Bearer token:
```
Authorization: Bearer <supabase-jwt-token>
```

---

## 📍 Submit GPS Ping

**POST** `/api/pings`

```json
// Request
{
  "lat": 25.5941,
  "lon": 85.1376,
  "speed_kmh": 25.5,      // optional
  "battery_pct": 78,      // optional
  "ts": "2025-11-10..."   // optional, defaults to now
}

// Response (201)
{
  "data": {
    "snapped_zone_id": "550e8400-e29b-41d4-a716-446655440000",
    "recommendation": [
      {
        "zone_id": "550e8400-...",
        "zone_name": "Gandhi Maidan",
        "score": 0.87,
        "distance_km": 2.3,
        "eta_min": 8,
        "reason": "82% success rate, nearby, high demand"
      }
    ]
  }
}
```

**Rate Limits:**
- 1 request/second per user
- 60 requests/minute per IP

**Errors:**
- `400` - Invalid coordinates
- `401` - Unauthorized
- `429` - Rate limit exceeded

---

## 🎯 Get Recommendations

**GET** `/api/recommendations/next-spot?lat=25.5941&lon=85.1376&limit=3`

Query params:
- `lat` (optional) - Current latitude
- `lon` (optional) - Current longitude  
- `limit` (optional) - Number of zones (default: 3, max: 10)

If `lat`/`lon` omitted, uses last location from driver state.

```json
// Response (200)
{
  "data": [
    {
      "zone_id": "550e8400-...",
      "zone_name": "Gandhi Maidan",
      "score": 0.87,
      "distance_km": 2.3,
      "eta_min": 8,
      "reason": "82% success rate, nearby, high demand"
    }
  ]
}
```

**Errors:**
- `400` - No location data available
- `401` - Unauthorized

---

## 📊 Get Driver State

**GET** `/api/driver-state`

```json
// Response (200)
{
  "data": {
    "driver_id": "auth-user-uuid",
    "last_ping_at": "2025-11-10T10:30:15.000Z",
    "lat": 25.5941,
    "lon": 85.1376,
    "snapped_zone_id": "550e8400-...",
    "speed_kmh": 25.5,
    "battery_pct": 78,
    "recommendation": [...],  // Top-3 cached
    "updated_at": "2025-11-10T10:30:15.500Z"
  }
}

// Response (204) - No state yet (new driver)
```

---

## 📋 List Recent Pings

**GET** `/api/pings?limit=50`

```json
// Response (200)
{
  "data": [
    {
      "id": "bigint",
      "lat": 25.5941,
      "lon": 85.1376,
      "recorded_at": "2025-11-10T10:30:00.000Z",
      "speed_kmh": 25.5,
      "battery_pct": 78
    }
  ]
}
```

---

## 🧮 Scoring Formula

```
Final Score = 0.4 × successRate + 0.3 × proximityScore + 0.2 × contextScore + 0.1 × priorityBonus
```

**Components:**
1. **Success Rate (40%)** - Historical booking→ride conversion (14-day window)
2. **Proximity (30%)** - Inverse distance (0.5km = 1.0, 10km = 0.0)
3. **Context (20%)** - Hotspots + airport waves + events
4. **Priority (10%)** - Airport zones, charger zones (battery-dependent)

**Tie-Breaking:** Distance (closer wins)

---

## 🔒 Security

✅ All endpoints require Bearer token  
✅ RLS enforced: `driver_id = auth.uid()`  
✅ Rate limiting per user + IP  
✅ Coordinate validation  
✅ No SQL injection (parameterized queries)  

---

## ⚡ Quick Test (PowerShell)

```powershell
# Get token from Supabase
$token = "your-jwt-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Submit ping
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

# Get driver state
Invoke-WebRequest -Uri "http://localhost:3000/api/driver-state" `
    -Headers $headers | ConvertFrom-Json

# Get recommendations
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot?limit=3" `
    -Headers $headers | ConvertFrom-Json
```

---

## 🐛 Common Issues

**"No location data available"**  
→ Submit a ping first OR provide lat/lon params

**"Rate limit exceeded"**  
→ Wait 1 second between pings

**Empty recommendations array**  
→ Check: zones exist, training data available, zones within 10km

**401 Unauthorized**  
→ Check token is valid and not expired

**DB_ERROR**  
→ Verify RLS policies and schema migration applied

---

## 📚 Full Documentation

- **[LIVE_TRACKING.md](./LIVE_TRACKING.md)** - Complete API reference
- **[MIGRATION_LIVE_TRACKING.md](./MIGRATION_LIVE_TRACKING.md)** - Deployment guide
- **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** - Test scenarios
- **[API_README.md](./API_README.md)** - All endpoints

---

## 🎯 Next Steps

1. Apply schema migration: See `MIGRATION_LIVE_TRACKING.md`
2. Restart dev server: `npm run dev`
3. Test endpoints with your auth token
4. Review Swagger UI: `http://localhost:3000/api/docs`
5. Deploy to production

**Status:** ✅ Ready for production use
