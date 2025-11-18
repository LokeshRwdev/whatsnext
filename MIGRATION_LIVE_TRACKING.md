# Live Tracking Schema Migration

## Overview
This migration adds the `driver_state` table and updates the `nearest_zone` function to support live tracking with GPS ping processing and zone recommendations.

## Changes

### 1. New Table: `driver_state`
Stores current driver location, snapped zone, battery, speed, and cached recommendations.

### 2. Updated Function: `nearest_zone`
Enhanced with `p_max_m` parameter to limit zone search radius (default 3000m).

### 3. New RLS Policies
- Drivers can SELECT/INSERT/UPDATE only their own `driver_state` row
- Enforced via `auth.uid() = driver_id`

## Deployment Steps

### Option A: Reset Database (Development Only)
```bash
# ⚠️ WARNING: Destroys all data
supabase db reset
```

### Option B: Apply Migration (Recommended)
```bash
# 1. Create a new migration
supabase migration new add_driver_state

# 2. Copy the relevant SQL from supabase/schema.sql:
#    - driver_state table creation
#    - Indexes for driver_state
#    - Updated nearest_zone function
#    - RLS policies for driver_state

# 3. Apply migration
supabase db push
```

### Option C: Manual SQL Execution
Run the following SQL in your Supabase SQL Editor:

```sql
-- Create driver_state table
CREATE TABLE IF NOT EXISTS public.driver_state (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_ping_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  geom GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) STORED,
  snapped_zone_id INTEGER REFERENCES public.zones(id),
  speed_kmh DOUBLE PRECISION,
  battery_pct SMALLINT CHECK (battery_pct >= 0 AND battery_pct <= 100),
  recommendation JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_driver_state_updated ON public.driver_state(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_state_geom ON public.driver_state USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_driver_state_zone ON public.driver_state(snapped_zone_id);

-- Update nearest_zone function
CREATE OR REPLACE FUNCTION public.nearest_zone(
  p_lon DOUBLE PRECISION, 
  p_lat DOUBLE PRECISION, 
  p_max_m DOUBLE PRECISION DEFAULT 3000
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT id 
  FROM public.zones
  WHERE ST_Distance(geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography) <= p_max_m
  ORDER BY ST_Distance(geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography)
  LIMIT 1;
$$;

-- Enable RLS
ALTER TABLE public.driver_state ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Drivers can view own state" ON public.driver_state;
CREATE POLICY "Drivers can view own state" ON public.driver_state FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own state" ON public.driver_state;
CREATE POLICY "Drivers can insert own state" ON public.driver_state FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can update own state" ON public.driver_state;
CREATE POLICY "Drivers can update own state" ON public.driver_state FOR UPDATE USING (auth.uid() = driver_id);

-- Add table comment
COMMENT ON TABLE public.driver_state IS 'Live tracking state and recommendations per driver';
```

## Verification

After applying the migration, verify:

### 1. Check Table Exists
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'driver_state';
```

### 2. Check RLS Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'driver_state';
```
Expected: 3 policies (SELECT, INSERT, UPDATE)

### 3. Check Indexes
```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'driver_state';
```
Expected: 4 indexes (primary key + 3 created indexes)

### 4. Test nearest_zone Function
```sql
-- Should return nearest zone within 3km
SELECT nearest_zone(85.1376, 25.5941, 3000);

-- Should return NULL if no zone within 1km
SELECT nearest_zone(85.1376, 25.5941, 1000);
```

## Rollback (If Needed)

```sql
-- Drop table (cascades to policies and indexes)
DROP TABLE IF EXISTS public.driver_state CASCADE;

-- Restore old nearest_zone function (if needed)
CREATE OR REPLACE FUNCTION public.nearest_zone(p_lat DOUBLE PRECISION, p_lon DOUBLE PRECISION)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT id 
  FROM public.zones
  ORDER BY ST_Distance(geom, ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography)
  LIMIT 1;
$$;
```

## Next Steps

1. ✅ Apply schema migration
2. ✅ Restart Next.js dev server: `npm run dev`
3. ✅ Test endpoints:
   - POST `/api/pings` - Submit GPS ping
   - GET `/api/driver-state` - Retrieve state
   - GET `/api/recommendations/next-spot` - Get recommendations
4. ✅ Review logs for any RLS errors
5. ✅ Test with multiple users to verify RLS isolation

## Optional: Enable Realtime (Feature Flag)

If you want live recommendation broadcasting:

```bash
# Add to .env.local
ENABLE_REALTIME_BROADCAST=true
```

Then enable realtime for the table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_state;
```

## Troubleshooting

### Error: "relation driver_state does not exist"
**Solution:** Schema migration not applied. Run the SQL above in Supabase SQL Editor.

### Error: "permission denied for table driver_state"
**Solution:** RLS policies not created. Verify with `SELECT * FROM pg_policies WHERE tablename = 'driver_state';`

### Error: "function nearest_zone(double precision, double precision, double precision) does not exist"
**Solution:** Old function signature still in use. Drop and recreate with new signature.

### Empty recommendations array
**Possible causes:**
1. No zones seeded: `SELECT COUNT(*) FROM zones;`
2. No training data: `SELECT COUNT(*) FROM training_examples;`
3. All zones > 10km away: Check driver location vs zone coordinates

## Support

For issues:
1. Check Supabase logs: Dashboard → Database → Logs
2. Verify RLS context: `SELECT auth.uid();` should return user ID
3. Test manually: Run recommendation queries in SQL Editor
4. Review [LIVE_TRACKING.md](./LIVE_TRACKING.md) for full documentation
