# API Testing Guide

## Prerequisites
- Next.js dev server running: `npm run dev`
- Supabase project configured with schema applied
- Valid Supabase auth token (from login)

## Testing Strategy

### Step 1: Test Public Endpoints (No Auth)

#### Health Check
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/health" | ConvertFrom-Json

# Expected Output:
# {
#   "data": {
#     "ok": true,
#     "time": "2025-11-09T..."
#   }
# }
```

#### OpenAPI Spec
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/openapi" | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Should return complete OpenAPI 3.1 JSON spec
```

#### Swagger UI
Open in browser: http://localhost:3000/api/docs

### Step 2: Get Auth Token

#### Option A: From Browser Console (after login)
```javascript
// Go to http://localhost:3000/login
// After magic link login, open browser console:
const { data: { session } } = await (await fetch('/api/auth/session')).json();
console.log(session.access_token);
```

#### Option B: From Supabase Client
```typescript
import { supabaseBrowser } from "@/lib/supabase-browser";

const { data: { session } } = await supabaseBrowser.auth.getSession();
const token = session?.access_token;
console.log(token);
```

### Step 3: Test Authenticated Endpoints

#### Set Token Variable (PowerShell)
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Your actual token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

#### List Zones
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/zones" -Headers $headers | ConvertFrom-Json

# Expected: Array of zones with id, name, geohash6, is_airport, is_charger
```

#### Create Ride Event
```powershell
$body = @{
    event_type = "booking_received"
    lat = 25.5941
    lon = 85.1376
    battery_pct = 65
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ride-events" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true } }
```

#### List Ride Events
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/ride-events?limit=10" -Headers $headers | ConvertFrom-Json

# Expected: Array of your ride events
```

#### Create Zone Visit
```powershell
$body = @{
    zone_id = "550e8400-e29b-41d4-a716-446655440000" # Use actual zone ID from /api/zones
    arrived_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    context = @{ source = "manual_test" }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/zone-visits" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true, "id": "..." } }
```

#### Update Zone Visit (set left_at)
```powershell
$visitId = "..." # From previous response
$body = @{
    left_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/zone-visits/$visitId" `
    -Method PATCH `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: Updated zone visit object
```

#### Create Ping
```powershell
$body = @{
    lat = 25.5941
    lon = 85.1376
    speed_kmh = 35.5
    battery_pct = 62
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/pings" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true, "id": "..." } }
```

#### Create Charge
```powershell
$body = @{
    station_zone = "550e8400-e29b-41d4-a716-446655440000" # Use charger zone ID
    start_at = (Get-Date).AddHours(-1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    end_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    kwh = 15.5
    cost_inr = 250
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/charges" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true, "id": "..." } }
```

#### List Charges
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/charges?limit=10" -Headers $headers | ConvertFrom-Json

# Expected: Array of your charges
```

### Step 4: Test Context Endpoints

#### Weather
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/context/weather" -Headers $headers | ConvertFrom-Json

# Expected: Latest weather observation or null if no data
```

#### Airport Wave
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/context/airport-wave" -Headers $headers | ConvertFrom-Json

# Expected: Array of current hour +/- 1 hour buckets with arrival/departure waves
```

#### Hotspot
```powershell
$zoneId = "550e8400-e29b-41d4-a716-446655440000"
Invoke-WebRequest -Uri "http://localhost:3000/api/context/hotspot?zone_id=$zoneId" -Headers $headers | ConvertFrom-Json

# Expected: Hotspot data for the zone or null
```

### Step 5: Test Recommendations

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot?lat=25.5941&lon=85.1376" `
    -Headers $headers | ConvertFrom-Json

# Expected: Array of top 3 recommended zones with score and reason
```

### Step 6: Test Admin Endpoints (Admin Only)

First, set `is_admin = true` for your user in the `profiles` table:
```sql
UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
```

#### Create Zone (Admin)
```powershell
$body = @{
    name = "Test Zone"
    lat = 25.6
    lon = 85.2
    is_airport = $false
    is_charger = $true
    meta = @{ test = "data" }
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/admin/zones" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true, "id": "..." } }
```

#### Update Zone (Admin)
```powershell
$zoneId = "..." # From previous response
$body = @{
    name = "Updated Test Zone"
    is_charger = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/admin/zones/$zoneId" `
    -Method PATCH `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: Updated zone object
```

#### Create City Event (Admin)
```powershell
$body = @{
    name = "Test Concert"
    category = "entertainment"
    venue_zone = "550e8400-e29b-41d4-a716-446655440000" # Actual zone ID
    start_at = (Get-Date).AddDays(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    end_at = (Get-Date).AddDays(1).AddHours(3).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    impact_score = 8.5
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/admin/events" `
    -Method POST `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: { "data": { "created": true, "id": "..." } }
```

#### Update City Event (Admin)
```powershell
$eventId = "..." # From previous response
$body = @{
    impact_score = 9.0
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/admin/events/$eventId" `
    -Method PATCH `
    -Headers $headers `
    -Body $body | ConvertFrom-Json

# Expected: Updated event object
```

## Error Testing

### Test Unauthorized (No Token)
```powershell
try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/zones"
} catch {
    $_.Exception.Response.StatusCode # Should be 401
}
```

### Test Forbidden (Non-Admin to Admin Endpoint)
```powershell
# With non-admin token
try {
    $body = @{ name = "Test" } | ConvertTo-Json
    Invoke-WebRequest -Uri "http://localhost:3000/api/admin/zones" `
        -Method POST `
        -Headers $headers `
        -Body $body
} catch {
    $_.Exception.Response.StatusCode # Should be 403
}
```

### Test Validation Error
```powershell
# Invalid event_type
$body = @{
    event_type = "invalid_type"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/ride-events" `
        -Method POST `
        -Headers $headers `
        -Body $body
} catch {
    $_.Exception.Response.StatusCode # Should be 400
}
```

## Automated Test Script

Save as `test-api.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "Testing API Endpoints..." -ForegroundColor Cyan

# Health Check
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "http://localhost:3000/api/health" | ConvertFrom-Json
Write-Host "✓ Health: $($health.data.ok)" -ForegroundColor Green

# List Zones
Write-Host "`n2. List Zones..." -ForegroundColor Yellow
$zones = Invoke-WebRequest -Uri "http://localhost:3000/api/zones" -Headers $headers | ConvertFrom-Json
Write-Host "✓ Found $($zones.data.Count) zones" -ForegroundColor Green

# Create Ride Event
Write-Host "`n3. Create Ride Event..." -ForegroundColor Yellow
$rideBody = @{
    event_type = "booking_received"
    lat = 25.5941
    lon = 85.1376
    battery_pct = 65
} | ConvertTo-Json
$ride = Invoke-WebRequest -Uri "http://localhost:3000/api/ride-events" -Method POST -Headers $headers -Body $rideBody | ConvertFrom-Json
Write-Host "✓ Created: $($ride.data.created)" -ForegroundColor Green

# List Events
Write-Host "`n4. List Ride Events..." -ForegroundColor Yellow
$events = Invoke-WebRequest -Uri "http://localhost:3000/api/ride-events?limit=5" -Headers $headers | ConvertFrom-Json
Write-Host "✓ Found $($events.data.Count) events" -ForegroundColor Green

# Recommendations
Write-Host "`n5. Get Recommendations..." -ForegroundColor Yellow
$recs = Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot" -Headers $headers | ConvertFrom-Json
Write-Host "✓ Got $($recs.data.Count) recommendations" -ForegroundColor Green
$recs.data | ForEach-Object {
    Write-Host "  - $($_.zone_name): $($_.reason)" -ForegroundColor Gray
}

Write-Host "`n✅ All tests passed!" -ForegroundColor Green
```

Run with:
```powershell
.\test-api.ps1 -Token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Using Swagger UI (Easiest Method)

1. Open http://localhost:3000/api/docs
2. Click "Authorize" button (top right)
3. Enter: `Bearer YOUR_TOKEN_HERE`
4. Click "Authorize" then "Close"
5. Try any endpoint using the "Try it out" button
6. All requests will include your auth token automatically

## Live Tracking Tests

### Test 1: Submit GPS Ping
```powershell
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

# Expected: 201 with { snapped_zone_id, recommendation: [...] }
```

### Test 2: Get Driver State
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/driver-state" `
    -Headers $headers | ConvertFrom-Json

# Expected: 200 with current state, or 204 if no pings submitted yet
```

### Test 3: Get Recommendations (with location)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot?lat=25.5941&lon=85.1376&limit=3" `
    -Headers $headers | ConvertFrom-Json

# Expected: Array of 3 zones with score, distance_km, eta_min, reason
```

### Test 4: Get Recommendations (from cached state)
```powershell
# After submitting a ping
Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/next-spot" `
    -Headers $headers | ConvertFrom-Json

# Expected: Uses last known location from driver_state
```

### Test 5: Rate Limit Test
```powershell
# Send multiple pings rapidly
1..5 | ForEach-Object {
    Invoke-WebRequest -Uri "http://localhost:3000/api/pings" `
        -Method POST `
        -Headers $headers `
        -Body $body
}

# Expected: First request succeeds, subsequent within 1 second return 429
```

### Test 6: Invalid Coordinates
```powershell
$badBody = @{
    lat = 95  # Invalid (out of -90 to 90 range)
    lon = 85.1376
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/pings" `
        -Method POST `
        -Headers $headers `
        -Body $badBody
} catch {
    $_.Exception.Response.StatusCode # Should be 400
}
```

For complete Live Tracking documentation, see **[LIVE_TRACKING.md](./LIVE_TRACKING.md)**.

## Troubleshooting

### Server Not Responding
```bash
# Check if server is running
npm run dev

# Should see: "Ready in XXXms" and "Local: http://localhost:3000"
```

### 401 Unauthorized
- Token expired (Supabase tokens expire after 1 hour by default)
- Token not included in Authorization header
- Solution: Get fresh token from new login session

### 403 Forbidden
- Accessing admin endpoint without `is_admin = true`
- Solution: Update profiles table or use non-admin endpoint

### 500 Internal Server Error
- Database schema not applied
- Environment variables not set
- Solution: Run `npm run db:apply` and check `.env.local`

### CORS Errors
- Not an issue for same-origin requests (app → API on localhost:3000)
- If calling from different origin, add CORS headers to routes

## Next Steps

1. ✅ Test all public endpoints work
2. ✅ Get valid auth token
3. ✅ Test CRUD operations for each resource
4. ✅ Test admin endpoints with admin user
5. ✅ Verify error handling (401, 403, 400, 404)
6. ✅ Check Swagger UI documentation
7. ✅ Export OpenAPI spec: `npm run openapi:emit`
8. 🚀 Deploy to production
