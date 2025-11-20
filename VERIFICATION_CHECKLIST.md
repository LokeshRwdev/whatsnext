# Quick Verification Checklist

## ✅ Immediate Tests (After Deployment)

### 1. Backend: Test API Endpoint Directly
```powershell
# From project root
.\test-next-spot.ps1
```

**Expected Result:**
- Test 1 should return 1-3 zones with valid coordinates
- Response should include `top` array with zone objects
- If empty, check `context.reason` field

### 2. Frontend: GPS Gating Works
1. Open driver dashboard (`http://localhost:3000`)
2. Open DevTools → Network tab
3. Enable live tracking
4. **Verify:**
   - ✅ UI shows "Waiting for GPS fix..." initially
   - ✅ Shows current accuracy if > 100m
   - ✅ No `/api/recommendations/next-spot` calls until accuracy < 100m
   - ✅ After good fix, API call includes `?lat=...&lon=...&k=3`

### 3. Server Logs: Check Diagnostics
Start dev server and watch logs:
```powershell
npm run dev
```

**Look for:**
```
[recommendations] candidate fetch result { 
  driverId: '...', 
  currentLoc: { lat: 25.58..., lon: 85.05... },
  totalZones: 42,
  zonesWithCoordinates: 42,
  candidateCount: 15 
}
```

**Bad patterns to watch for:**
- `candidateCount: 0` when `zonesWithCoordinates > 0` → zones too far
- `zonesWithCoordinates: 0` when `totalZones > 0` → missing coords
- `totalZones: 0` → empty zones table

---

## 🔍 Database Health Check

Run in Supabase SQL Editor:
```sql
-- Quick health check
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active,
  COUNT(CASE WHEN (lat IS NOT NULL AND lon IS NOT NULL) OR center IS NOT NULL THEN 1 END) as with_coords
FROM zones;
```

**Expected:**
- `total > 0`
- `active > 0`
- `with_coords = active` (all active zones have coordinates)

**If `with_coords = 0`:** Run full diagnostic:
```powershell
# Open Supabase SQL Editor and paste contents of:
cat supabase/diagnostics/check-zones.sql
```

---

## 🚨 Common Issues & Fixes

### Issue: `top: []` despite zones existing

**Diagnosis:**
```sql
-- Check nearest zones to test location
SELECT 
  id, name, lat, lon,
  ROUND(ST_Distance(
    ST_SetSRID(ST_MakePoint(85.0583753, 25.5852636), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) / 1000, 2) as distance_km
FROM zones
WHERE is_active = true AND lat IS NOT NULL AND lon IS NOT NULL
ORDER BY distance_km
LIMIT 5;
```

**Solutions:**
1. **All zones too far (>18km)**:
   - Response will include `context.reason: "zones_too_far"`
   - Increase `DEFAULT_MAX_DISTANCE_KM` in `recommendation.ts`
   - Or add closer zones to the database

2. **No coordinates**:
   - Response will include `context.reason: "no_zones_with_coords"`
   - Populate `lat`/`lon` or `center` columns:
     ```sql
     UPDATE zones SET 
       lat = ST_Y(center::geometry),
       lon = ST_X(center::geometry)
     WHERE center IS NOT NULL;
     ```

3. **Empty database**:
   - Response will include `context.reason: "no_zones_in_db"`
   - Import zone seed data

---

### Issue: Frontend shows "Waiting for GPS fix..." forever

**Diagnosis:**
1. Check browser console for errors
2. Check if `navigator.geolocation` is available
3. Check location permission (browser settings)
4. Check if accuracy is being reported

**Solutions:**
1. **Permission denied**: Browser blocked location access
   - Clear site data and retry
   - Or use Chrome incognito mode

2. **Desktop browser**: GPS may not be available
   - Test on phone or enable location spoofing in DevTools
   - Chrome: DevTools → ⋮ Menu → More tools → Sensors → Location

3. **Accuracy always >100m**: Weak GPS signal
   - Move outdoors / near window
   - Or temporarily lower threshold in `useLiveTracking.ts`:
     ```typescript
     const hasLocation = ... && lastFix.accuracy <= 200; // Relaxed for testing
     ```

---

### Issue: API returns 401 Unauthorized

**Diagnosis:**
```powershell
# Check if user is logged in
curl http://localhost:3000/api/recommendations/next-spot?lat=25.58&lon=85.05&k=3 -H "Cookie: ..."
```

**Solutions:**
1. Ensure you're logged in via `/login`
2. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Verify Supabase auth session is valid (check cookies)

---

## 📊 Success Metrics

After fix is deployed, you should see:

### Backend
- ✅ Zero occurrences of `top: []` when `totalZones > 0` and `zonesWithCoordinates > 0`
- ✅ `[recommendations] CRITICAL` log never appears
- ✅ Response includes `source: "fallback"` when using nearest-by-distance
- ✅ Response includes `context.reason` when `top` is legitimately empty

### Frontend
- ✅ No premature API calls (before GPS < 100m)
- ✅ Clear user feedback about GPS quality
- ✅ API calls always include `lat` and `lon` query params
- ✅ Recommendations load within 5 seconds of good GPS fix

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Run `.\test-next-spot.ps1` and verify all tests pass
- [ ] Run SQL diagnostics and verify `with_coords > 0`
- [ ] Test on mobile device with actual GPS
- [ ] Verify server logs show candidate counts
- [ ] Test with weak GPS signal (accuracy 50-150m)
- [ ] Test with no internet (should queue pings)
- [ ] Test rapid location changes (should throttle requests)
- [ ] Verify recommendations update every 3 minutes when tracking
- [ ] Test manual refresh button in NextZonesPanel
- [ ] Check that fallback recommendations are reasonable (nearest zones)

---

## 📝 Rollback Plan

If issues arise in production:

1. **Revert backend changes:**
   ```bash
   git revert <commit-hash>  # Revert recommendation.ts changes
   ```

2. **Revert frontend gating:** (less critical, can stay)
   ```bash
   git revert <commit-hash>  # Revert NextZonesPanel.tsx changes
   ```

3. **Emergency patch:**
   - Set `DEFAULT_MAX_DISTANCE_KM = 50` to allow more zones
   - Lower `hasLocation` accuracy threshold to 200m temporarily

---

## 🔗 Related Files

- **Backend Logic**: `lib/server/recommendation.ts`
- **API Route**: `app/api/recommendations/next-spot/route.ts`
- **GPS Hook**: `hooks/useLiveTracking.ts`
- **UI Component**: `components/NextZonesPanel.tsx`
- **Dashboard**: `app/(driver)/DriverHomeClient.tsx`
- **Test Script**: `test-next-spot.ps1`
- **SQL Diagnostics**: `supabase/diagnostics/check-zones.sql`
- **Documentation**: `RECOMMENDATIONS_FIX_SUMMARY.md`

---

## 📞 Support

If recommendations are still empty after all fixes:

1. Run full diagnostic: `supabase/diagnostics/check-zones.sql`
2. Share server logs (grep for `[recommendations]`)
3. Share test script output: `.\test-next-spot.ps1`
4. Share one sample zone row: `SELECT * FROM zones LIMIT 1;`

**Quick debug command:**
```powershell
# Capture full diagnostic output
npm run dev > server.log 2>&1 &
.\test-next-spot.ps1 > test-output.txt
# Share server.log and test-output.txt
```
