# Recommendations API Fix - Implementation Summary

## Problem Statement
The `/api/recommendations/next-spot` endpoint was returning `top: []` (empty recommendations) even when:
- Valid `lat` and `lon` query parameters were provided
- The `zones` table contained rows with coordinates
- The request was properly authenticated

Additionally, the frontend was calling the API before GPS location was available, causing unnecessary errors.

## Root Causes Identified

### Backend Issues
1. **No Guaranteed Fallback**: When scoring produced empty results (due to missing training data), the system didn't fall back to simple nearest-by-distance sorting
2. **Insufficient Logging**: Hard to debug why candidates or scoring failed
3. **Missing Reason Codes**: Empty responses didn't include diagnostic information

### Frontend Issues
1. **Premature API Calls**: `NextZonesPanel` called the API even without a valid GPS fix
2. **No Location Quality Gates**: Hook didn't expose whether location was "ready" (accuracy < 100m)
3. **Poor UX Messaging**: Users weren't informed why recommendations weren't loading

---

## Changes Implemented

### 🔧 Backend Changes

#### 1. `lib/server/recommendation.ts`
**computeNextZonesForDriver() - Double-Fallback Safety Net**
- Added comprehensive logging of candidate fetch results (total zones, zones with coords, candidate count)
- Introduced reason codes: `no_zones_in_db`, `no_zones_with_coords`, `zones_too_far`
- **CRITICAL FIX**: Added emergency fallback that ensures `top` is never empty when `candidates.length > 0`:
  ```typescript
  // If scored list is empty, build fallback from nearest zones
  if (topRecommendations.length === 0 && candidates.length > 0) {
    topRecommendations = buildFallbackRecommendations(candidates, k, currentSpeedKmh);
    trafficSource = "fallback";
  }
  
  // Additional safety: emergency nearest-by-distance if still empty
  if (topRecommendations.length === 0 && candidates.length > 0) {
    // Force nearest K zones by distance with minimal viable scores
  }
  ```

**fetchCandidateZones() - Already Robust**
- Already implements 3-tier radius search (default → relaxed → all)
- Already handles zones without coordinates gracefully
- Already sorts by distance and returns structured result

**resolveZoneCoordinates() - Already Comprehensive**
- Already checks `lat`/`lon` fields first
- Already parses `center` geometry (GeoJSON + WKT)
- Already handles `geom` fallback

**buildFallbackRecommendations() - Already Exists**
- Creates viable recommendations from pure distance + zone weights
- Returns zones with reasonable default scores (0.35 success prob, default fare)

#### 2. `app/api/recommendations/next-spot/route.ts`
**Already Correct**
- Query param parsing already validates `lat`/`lon` as finite numbers
- Already checks latitude/longitude ranges
- Already uses provided coords as `currentLoc` when present
- Already has proper error handling with 400/401/500 responses

---

### 🎨 Frontend Changes

#### 1. `hooks/useLiveTracking.ts`
**New Exports: `hasLocation` and `isFetchingLocation`**
```typescript
const hasLocation =
  lastFix !== null &&
  typeof lastFix.accuracy === "number" &&
  Number.isFinite(lastFix.accuracy) &&
  lastFix.accuracy <= 100;  // Require <100m accuracy

const isFetchingLocation = trackingOn && !hasLocation;

return {
  // ...existing exports
  hasLocation,
  isFetchingLocation,
};
```

**Quality Gates**
- `hasLocation`: Only true when accuracy is ≤100 meters (reasonable GPS fix)
- `isFetchingLocation`: True while tracking is on but no good fix yet
- These flags allow UI components to gate API calls and show appropriate loading states

#### 2. `components/NextZonesPanel.tsx`
**GPS Gating in `fetchLatest()`**
```typescript
const fetchLatest = useCallback(async () => {
  const loc = lastFixRef.current;
  
  // GATING: Do not fetch if we don't have a valid location
  if (!loc || typeof loc.accuracy !== "number" || loc.accuracy > 100) {
    setError("Waiting for GPS fix (accuracy <100m). Move outdoors for better signal.");
    setLoading(false);
    return;
  }
  
  // Now guaranteed to have valid lat/lon with acceptable accuracy
  const params = { k: 3, lat: loc.lat, lon: loc.lon };
  const { data, error } = await fetchRecommendations(params);
  // ...
}, [syncRecommendation]);
```

**Improved `waitingForGps` Check**
```typescript
const waitingForGps =
  trackingOn &&
  (!lastFix || typeof lastFix.accuracy !== "number" || lastFix.accuracy > 100);
```

**Better UX Messaging**
```tsx
{waitingForGps ? (
  <div>
    <p className="font-medium">Waiting for GPS fix...</p>
    <p className="mt-1 text-xs">
      Move outdoors for clear sky view. Accuracy must be &lt;100m.
    </p>
    {lastFix?.accuracy && (
      <p className="mt-1 text-xs text-amber-600">
        Current accuracy: {lastFix.accuracy.toFixed(0)}m
      </p>
    )}
  </div>
) : (
  "We'll start suggesting zones once we see your location."
)}
```

---

## Testing

### Run the Test Script
```powershell
cd C:\Users\Lokes\Desktop\projects\whatsnext
.\test-next-spot.ps1
```

### Manual Test via Browser
1. Open DevTools → Network tab
2. Navigate to driver dashboard
3. Enable live tracking
4. Watch for:
   - "Waiting for GPS fix..." message while accuracy > 100m
   - Recommendation request only fires after accuracy < 100m
   - Server logs show `[recommendations]` with candidate counts

### Expected Behavior After Fix

#### Backend
- `GET /api/recommendations/next-spot?lat=25.5852636&lon=85.0583753&k=3` **ALWAYS** returns:
  - `top` array with up to 3 zones (if `zones` table has any with coordinates)
  - `source: "fallback"` when using nearest-by-distance
  - `context.reason` explaining why if `top` is empty
  - Detailed server logs showing candidate fetch and fallback triggers

#### Frontend
- No API calls until GPS accuracy is ≤100 meters
- Clear user feedback about GPS signal quality
- Shows current accuracy if waiting for better fix
- Auto-refreshes recommendations after good fix acquired

---

## Verification Checklist

### Backend Health Checks
```sql
-- 1. Confirm zones exist with coordinates
SELECT COUNT(*) FROM zones WHERE is_active = true;

-- 2. Sample zone coordinates
SELECT id, name, lat, lon, ST_AsText(center) FROM zones LIMIT 10;

-- 3. Check for zones near test location
SELECT 
  id, 
  name, 
  ST_Distance(
    center::geography,
    ST_SetSRID(ST_MakePoint(85.0583753, 25.5852636), 4326)::geography
  ) / 1000 as distance_km
FROM zones
WHERE is_active = true
ORDER BY distance_km
LIMIT 5;
```

### Server Logs to Watch
When testing, look for these log messages:
```
[recommendations] candidate fetch result { driverId, currentLoc, totalZones, zonesWithCoordinates, candidateCount }
[recommendations] No candidates available { reason: 'no_zones_with_coords' | 'zones_too_far' | 'no_zones_in_db' }
[recommendations] scored list empty, falling back to nearest zones { candidateCount }
[recommendations] CRITICAL: topRecommendations empty despite candidates (should never happen now)
```

### Frontend Behavior
1. **On page load with tracking OFF**:
   - Shows "We'll start suggesting zones once we see your location."
   - No API calls

2. **After enabling tracking**:
   - Shows "Waiting for GPS fix..." with accuracy meter
   - No API calls while accuracy > 100m
   - Once accuracy ≤100m → fires API request with `lat` & `lon` query params

3. **After successful fix**:
   - Shows 1-3 zone recommendations
   - Auto-refreshes every 3 minutes (if still tracking)
   - Manual refresh button works

---

## Debugging Guide

If `top: []` still occurs after this fix:

### Step 1: Check Zones Table
```sql
SELECT 
  COUNT(*) as total,
  COUNT(lat) as has_lat,
  COUNT(lon) as has_lon,
  COUNT(center) as has_center
FROM zones
WHERE is_active = true;
```
Expected: `total > 0` and `(has_lat + has_lon > 0) OR (has_center > 0)`

### Step 2: Check Server Logs
Look for the new `[recommendations]` log entries. The `candidate fetch result` log will show:
- `totalZones`: How many zones are in DB
- `zonesWithCoordinates`: How many have parseable coords
- `candidateCount`: How many passed distance filter

If `candidateCount = 0` but `zonesWithCoordinates > 0`:
- Zones exist but are all too far (>18km by default)
- Response will include `context.reason: "zones_too_far"`

### Step 3: Check API Response Context
```json
{
  "data": {
    "top": [],
    "context": {
      "reason": "no_zones_with_coords"  // ← This tells you why
    }
  }
}
```

### Step 4: Verify Environment Variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (for server-side queries)
```

---

## Performance Notes

- **Candidate Fetch**: Capped at 200 zones, then filtered to 25 nearest
- **Traffic API**: Falls back to estimated ETA if Google Maps quota exceeded
- **Caching**: Driver state recommendations cached for 60 seconds
- **Auto-refresh**: UI polls every 3 minutes when tracking is active

---

## Future Enhancements (Optional)

1. **PostGIS Spatial Index**: Use `ST_DWithin` for O(log n) candidate filtering instead of fetching all zones
2. **Progressive Accuracy**: Allow recommendations with accuracy 100-200m but mark them as "low confidence"
3. **Manual Location Override**: Let user tap map to override GPS if signal is poor
4. **Offline Mode**: Cache last known recommendations for offline viewing
5. **A/B Testing**: Track whether fallback recommendations perform as well as scored ones

---

## Files Modified

### Backend
- ✅ `lib/server/recommendation.ts` (added double-fallback + logging)

### Frontend
- ✅ `hooks/useLiveTracking.ts` (added `hasLocation` + `isFetchingLocation`)
- ✅ `components/NextZonesPanel.tsx` (added GPS gating + better UX)

### Test Assets
- ✅ `test-next-spot.ps1` (PowerShell test script)

---

## Migration Required?

**NO** - These are pure code changes. No database schema changes needed.

The fix assumes your `zones` table already has:
- `lat` and `lon` columns (numeric), OR
- `center` column (PostGIS geometry/geography)

If neither exists, run:
```sql
-- Option 1: Add lat/lon if you have center
UPDATE zones
SET 
  lat = ST_Y(center::geometry),
  lon = ST_X(center::geometry)
WHERE center IS NOT NULL;

-- Option 2: Add center if you have lat/lon
UPDATE zones
SET center = ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
WHERE lat IS NOT NULL AND lon IS NOT NULL;
```

---

## Support

If issues persist after applying this fix:
1. Share the output of `.\test-next-spot.ps1`
2. Share relevant server logs (search for `[recommendations]`)
3. Share the SQL result of zone coordinate check (Step 1 above)
