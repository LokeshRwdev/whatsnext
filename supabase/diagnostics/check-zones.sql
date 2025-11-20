-- Diagnostic queries for recommendations API debugging
-- Run these in Supabase SQL Editor to verify zone data quality

-- 1. Check total zones and coordinate coverage
SELECT 
  COUNT(*) as total_zones,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_zones,
  COUNT(lat) as zones_with_lat,
  COUNT(lon) as zones_with_lon,
  COUNT(center) as zones_with_center,
  COUNT(CASE WHEN lat IS NOT NULL AND lon IS NOT NULL THEN 1 END) as zones_with_both_latlon,
  COUNT(CASE WHEN (lat IS NOT NULL AND lon IS NOT NULL) OR center IS NOT NULL THEN 1 END) as zones_with_any_coords
FROM zones;

-- 2. Sample active zones with their coordinates
SELECT 
  id,
  name,
  slug,
  lat,
  lon,
  ST_AsText(center) as center_wkt,
  is_active,
  radius_km,
  weight_demand
FROM zones
WHERE is_active = true
ORDER BY id
LIMIT 10;

-- 3. Find nearest zones to test location (Patna: 25.5852636, 85.0583753)
SELECT 
  id,
  name,
  lat,
  lon,
  ROUND(
    ST_Distance(
      ST_SetSRID(ST_MakePoint(85.0583753, 25.5852636), 4326)::geography,
      COALESCE(
        center::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
      )
    ) / 1000,
    2
  ) as distance_km,
  is_active
FROM zones
WHERE 
  (lat IS NOT NULL AND lon IS NOT NULL) 
  OR center IS NOT NULL
ORDER BY 
  COALESCE(
    center::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
  ) <-> ST_SetSRID(ST_MakePoint(85.0583753, 25.5852636), 4326)::geography
LIMIT 10;

-- 4. Check for zones with invalid coordinates
SELECT 
  id,
  name,
  lat,
  lon,
  center,
  CASE
    WHEN lat IS NOT NULL AND (lat < -90 OR lat > 90) THEN 'Invalid latitude'
    WHEN lon IS NOT NULL AND (lon < -180 OR lon > 180) THEN 'Invalid longitude'
    WHEN center IS NOT NULL AND ST_IsValid(center::geometry) = false THEN 'Invalid center geometry'
    ELSE 'OK'
  END as validation_status
FROM zones
WHERE 
  (lat IS NOT NULL AND (lat < -90 OR lat > 90))
  OR (lon IS NOT NULL AND (lon < -180 OR lon > 180))
  OR (center IS NOT NULL AND ST_IsValid(center::geometry) = false);

-- 5. Check training data availability
SELECT 
  COUNT(*) as total_training_examples,
  COUNT(DISTINCT zone_id) as zones_with_training,
  MIN(created_at) as earliest_example,
  MAX(created_at) as latest_example
FROM training_examples;

-- 6. Check trip/fare data availability
SELECT 
  COUNT(*) as total_trips,
  COUNT(DISTINCT pickup_zone) as zones_with_trips,
  ROUND(AVG(fare_inr), 2) as avg_fare
FROM trips
WHERE completed_at IS NOT NULL;

-- 7. Check nearest_zone function exists
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'nearest_zone';

-- 8. Test nearest_zone function with sample coordinates
SELECT nearest_zone(
  p_lon := 85.0583753,
  p_lat := 25.5852636,
  p_max_m := 3000
) as nearest_zone_id;

-- 9. Check if any zones are suspiciously far from Patna center
SELECT 
  id,
  name,
  lat,
  lon,
  ROUND(
    ST_Distance(
      ST_SetSRID(ST_MakePoint(85.13348, 25.5941), 4326)::geography,  -- Patna city center
      COALESCE(
        center::geography,
        ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
      )
    ) / 1000,
    2
  ) as distance_from_patna_km
FROM zones
WHERE is_active = true
HAVING 
  ST_Distance(
    ST_SetSRID(ST_MakePoint(85.13348, 25.5941), 4326)::geography,
    COALESCE(
      center::geography,
      ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
    )
  ) / 1000 > 50  -- More than 50km from Patna
ORDER BY distance_from_patna_km DESC;

-- 10. Summary health check
SELECT 
  'Zones' as check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ FAIL: No zones in database'
    WHEN COUNT(CASE WHEN (lat IS NOT NULL AND lon IS NOT NULL) OR center IS NOT NULL THEN 1 END) = 0 THEN '❌ FAIL: No zones have coordinates'
    WHEN COUNT(CASE WHEN is_active = true THEN 1 END) = 0 THEN '⚠️ WARNING: No active zones'
    ELSE '✅ PASS: ' || COUNT(CASE WHEN is_active = true AND ((lat IS NOT NULL AND lon IS NOT NULL) OR center IS NOT NULL) THEN 1 END)::text || ' active zones with coords'
  END as status
FROM zones
UNION ALL
SELECT 
  'nearest_zone function' as check_type,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ FAIL: Function does not exist'
    ELSE '✅ PASS: Function exists'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'nearest_zone';
