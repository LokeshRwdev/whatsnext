-- Patna EV Co-Pilot Database Schema
-- Full production-ready schema with RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =============================================
-- Core Tables
-- =============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones (geographic regions in Patna)
CREATE TABLE IF NOT EXISTS public.zones (
  id SERIAL PRIMARY KEY,
  slug TEXT,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  center GEOGRAPHY(POINT, 4326),
  radius_km DOUBLE PRECISION DEFAULT 3,
  weight_demand DOUBLE PRECISION DEFAULT 1,
  weight_airport DOUBLE PRECISION DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.zones
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lon DROP NOT NULL;

ALTER TABLE public.zones
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS center GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS radius_km DOUBLE PRECISION DEFAULT 3,
  ADD COLUMN IF NOT EXISTS weight_demand DOUBLE PRECISION DEFAULT 1,
  ADD COLUMN IF NOT EXISTS weight_airport DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

UPDATE public.zones
SET center = ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
WHERE center IS NULL AND lat IS NOT NULL AND lon IS NOT NULL;

UPDATE public.zones
SET slug = COALESCE(slug, regexp_replace(lower(name), '[^a-z0-9]+', '_', 'g'))
WHERE slug IS NULL AND name IS NOT NULL;

ALTER TABLE public.zones
  ALTER COLUMN center SET NOT NULL;

ALTER TABLE public.zones
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_zones_slug_unique ON public.zones(slug);
CREATE INDEX IF NOT EXISTS idx_zones_center_gist ON public.zones USING GIST(center);

-- Ride Events (booking_received, ride_started, ride_completed, booking_cancelled)
CREATE TABLE IF NOT EXISTS public.ride_events (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('booking_received', 'ride_started', 'ride_completed', 'booking_cancelled')),
  occurred_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOGRAPHY(POINT, 4326),
  battery_pct SMALLINT CHECK (battery_pct >= 0 AND battery_pct <= 100),
  zone_id INTEGER REFERENCES public.zones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ride_events_driver_occurred ON public.ride_events(driver_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ride_events_geom ON public.ride_events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_ride_events_zone_id ON public.ride_events(zone_id);

-- Ensure ride_events has the extended analytics columns used by the app
ALTER TABLE public.ride_events
  ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IS NULL OR platform IN ('ola', 'uber')),
  ADD COLUMN IF NOT EXISTS fare_inr DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS distance_km DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS pickup_zone INTEGER REFERENCES public.zones(id),
  ADD COLUMN IF NOT EXISTS drop_zone INTEGER REFERENCES public.zones(id),
  ADD COLUMN IF NOT EXISTS pickup_loc GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS drop_loc GEOGRAPHY(POINT, 4326),
  ADD COLUMN IF NOT EXISTS surge_multiplier DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT CHECK (cancel_reason IS NULL OR cancel_reason IN ('driver', 'rider', 'platform')),
  ADD COLUMN IF NOT EXISTS deadhead_distance_km DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS deadhead_time_min DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_ride_events_pickup_zone ON public.ride_events(pickup_zone);
CREATE INDEX IF NOT EXISTS idx_ride_events_drop_zone ON public.ride_events(drop_zone);

-- Zone Visits (aggregated from ride_events)
CREATE TABLE IF NOT EXISTS public.zone_visits (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  booking_count INTEGER DEFAULT 0,
  ride_count INTEGER DEFAULT 0,
  cancel_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, zone_id, visit_date)
);

CREATE INDEX IF NOT EXISTS idx_zone_visits_driver_date ON public.zone_visits(driver_id, visit_date DESC);

-- GPS Pings (high-frequency location tracking)
CREATE TABLE IF NOT EXISTS public.pings (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL,
  loc GEOMETRY(POINT, 4326) NOT NULL,
  lat DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(loc)) STORED,
  lon DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(loc)) STORED,
  accuracy_m DOUBLE PRECISION,
  speed_kmh DOUBLE PRECISION,
  battery_pct SMALLINT CHECK (battery_pct >= 0 AND battery_pct <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.pings.accuracy_m IS 'GPS horizontal accuracy in meters for this ping';

CREATE INDEX IF NOT EXISTS idx_pings_driver_ts ON public.pings(driver_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_pings_loc ON public.pings USING GIST(loc);

-- Charges (battery charging events)
CREATE TABLE IF NOT EXISTS public.charges (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOGRAPHY(POINT, 4326),
  battery_before SMALLINT CHECK (battery_before >= 0 AND battery_before <= 100),
  battery_after SMALLINT CHECK (battery_after >= 0 AND battery_after <= 100),
  zone_id INTEGER REFERENCES public.zones(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_charges_driver_started ON public.charges(driver_id, started_at DESC);

-- Context Feeds (manual driver feedback)
CREATE TABLE IF NOT EXISTS public.context_feeds (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id INTEGER REFERENCES public.zones(id),
  context_type TEXT NOT NULL CHECK (context_type IN ('busy', 'slow', 'weather', 'event', 'other')),
  note TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_context_feeds_driver ON public.context_feeds(driver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_context_feeds_zone ON public.context_feeds(zone_id, created_at DESC);

-- Training Examples (for ML pipeline)
CREATE TABLE IF NOT EXISTS public.training_examples (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  zone_id INTEGER NOT NULL REFERENCES public.zones(id),
  hour_of_day SMALLINT NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  booking_count INTEGER NOT NULL DEFAULT 0,
  ride_count INTEGER NOT NULL DEFAULT 0,
  avg_battery DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_examples_zone_time ON public.training_examples(zone_id, hour_of_day, day_of_week);

-- Zone Context (30-min aggregated stats per zone)
CREATE TABLE IF NOT EXISTS public.zone_context_30m (
  id BIGSERIAL PRIMARY KEY,
  zone_id INTEGER NOT NULL REFERENCES public.zones(id),
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  active_drivers INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  ride_count INTEGER DEFAULT 0,
  avg_battery DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(zone_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_zone_context_30m_zone_window ON public.zone_context_30m(zone_id, window_start DESC);

-- Driver State (live tracking state per driver)
CREATE TABLE IF NOT EXISTS public.driver_state (
  driver_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_ping_at TIMESTAMPTZ NOT NULL,
  loc GEOMETRY(POINT, 4326) NOT NULL,
  lat DOUBLE PRECISION GENERATED ALWAYS AS (ST_Y(loc)) STORED,
  lon DOUBLE PRECISION GENERATED ALWAYS AS (ST_X(loc)) STORED,
  snapped_zone INTEGER REFERENCES public.zones(id),
  speed_kmh DOUBLE PRECISION,
  battery_pct SMALLINT CHECK (battery_pct >= 0 AND battery_pct <= 100),
  recommendation JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_state_updated ON public.driver_state(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_state_loc ON public.driver_state USING GIST(loc);
CREATE INDEX IF NOT EXISTS idx_driver_state_zone ON public.driver_state(snapped_zone);

-- =============================================
-- Functions
-- =============================================

-- Find nearest zone given lat/lon with max distance
CREATE OR REPLACE FUNCTION public.nearest_zone(
  p_lon DOUBLE PRECISION, 
  p_lat DOUBLE PRECISION, 
  p_max_m DOUBLE PRECISION DEFAULT 3000
)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  WITH driver_point AS (
    SELECT ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography AS geom
  )
  SELECT z.id
  FROM driver_point dp
  JOIN public.zones z ON TRUE
  CROSS JOIN LATERAL (
    SELECT COALESCE(
      z.center,
      CASE
        WHEN z.lon IS NOT NULL AND z.lat IS NOT NULL
          THEN ST_SetSRID(ST_MakePoint(z.lon, z.lat), 4326)::geography
        ELSE NULL
      END
    ) AS zone_geom
  ) zg
  WHERE z.is_active IS DISTINCT FROM FALSE
    AND zg.zone_geom IS NOT NULL
    AND ST_Distance(zg.zone_geom, dp.geom) <= p_max_m
  ORDER BY ST_Distance(zg.zone_geom, dp.geom)
  LIMIT 1;
$$;

-- Legacy nearest_zone with old signature (for backward compatibility)
CREATE OR REPLACE FUNCTION public.nearest_zone(p_lat DOUBLE PRECISION, p_lon DOUBLE PRECISION)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT public.nearest_zone(p_lon, p_lat, 3000);
$$;

-- Ingest ride event RPC (called from Edge Function)
CREATE OR REPLACE FUNCTION public.ingest_ride_event(
  p_event_type TEXT,
  p_occurred_at TIMESTAMPTZ,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lon DOUBLE PRECISION DEFAULT NULL,
  p_battery_pct SMALLINT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_driver_id UUID;
  v_zone_id INTEGER;
  v_geom GEOGRAPHY;
BEGIN
  -- Get authenticated user
  v_driver_id := auth.uid();
  IF v_driver_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate zone and geom if coords provided
  IF p_lat IS NOT NULL AND p_lon IS NOT NULL THEN
    v_zone_id := public.nearest_zone(p_lat, p_lon);
    v_geom := ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography;
  END IF;

  -- Insert ride event
  INSERT INTO public.ride_events (driver_id, event_type, occurred_at, lat, lon, geom, battery_pct, zone_id)
  VALUES (v_driver_id, p_event_type, p_occurred_at, p_lat, p_lon, v_geom, p_battery_pct, v_zone_id);
END;
$$;

-- Trigger to update zone_visits after ride_event insert
CREATE OR REPLACE FUNCTION public.update_zone_visits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.zone_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.zone_visits (driver_id, zone_id, visit_date, booking_count, ride_count, cancel_count)
  VALUES (
    NEW.driver_id, 
    NEW.zone_id, 
    DATE(NEW.occurred_at),
    CASE WHEN NEW.event_type = 'booking_received' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'ride_started' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'booking_cancelled' THEN 1 ELSE 0 END
  )
  ON CONFLICT (driver_id, zone_id, visit_date)
  DO UPDATE SET
    booking_count = public.zone_visits.booking_count + CASE WHEN NEW.event_type = 'booking_received' THEN 1 ELSE 0 END,
    ride_count = public.zone_visits.ride_count + CASE WHEN NEW.event_type = 'ride_started' THEN 1 ELSE 0 END,
    cancel_count = public.zone_visits.cancel_count + CASE WHEN NEW.event_type = 'booking_cancelled' THEN 1 ELSE 0 END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_zone_visits ON public.ride_events;
CREATE TRIGGER trg_update_zone_visits
AFTER INSERT ON public.ride_events
FOR EACH ROW
EXECUTE FUNCTION public.update_zone_visits();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_context_30m ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Ride events policies
DROP POLICY IF EXISTS "Drivers can view own ride events" ON public.ride_events;
CREATE POLICY "Drivers can view own ride events" ON public.ride_events FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own ride events" ON public.ride_events;
CREATE POLICY "Drivers can insert own ride events" ON public.ride_events FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Zone visits policies
DROP POLICY IF EXISTS "Drivers can view own zone visits" ON public.zone_visits;
CREATE POLICY "Drivers can view own zone visits" ON public.zone_visits FOR SELECT USING (auth.uid() = driver_id);

-- Pings policies
DROP POLICY IF EXISTS "Drivers can view own pings" ON public.pings;
CREATE POLICY "Drivers can view own pings" ON public.pings FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own pings" ON public.pings;
CREATE POLICY "Drivers can insert own pings" ON public.pings FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Charges policies
DROP POLICY IF EXISTS "Drivers can view own charges" ON public.charges;
CREATE POLICY "Drivers can view own charges" ON public.charges FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own charges" ON public.charges;
CREATE POLICY "Drivers can insert own charges" ON public.charges FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Context feeds policies
DROP POLICY IF EXISTS "Drivers can view own context feeds" ON public.context_feeds;
CREATE POLICY "Drivers can view own context feeds" ON public.context_feeds FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own context feeds" ON public.context_feeds;
CREATE POLICY "Drivers can insert own context feeds" ON public.context_feeds FOR INSERT WITH CHECK (auth.uid() = driver_id);

-- Training examples policies (read-only for all authenticated)
DROP POLICY IF EXISTS "Authenticated users can view training examples" ON public.training_examples;
CREATE POLICY "Authenticated users can view training examples" ON public.training_examples FOR SELECT USING (auth.uid() IS NOT NULL);

-- Zone context policies (read-only for all authenticated)
DROP POLICY IF EXISTS "Authenticated users can view zone context" ON public.zone_context_30m;
CREATE POLICY "Authenticated users can view zone context" ON public.zone_context_30m FOR SELECT USING (auth.uid() IS NOT NULL);

-- Zones table (public read for all authenticated users)
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view zones" ON public.zones;
CREATE POLICY "Authenticated users can view zones" ON public.zones FOR SELECT USING (auth.uid() IS NOT NULL);

-- Driver state policies
ALTER TABLE public.driver_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Drivers can view own state" ON public.driver_state;
CREATE POLICY "Drivers can view own state" ON public.driver_state FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can insert own state" ON public.driver_state;
CREATE POLICY "Drivers can insert own state" ON public.driver_state FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can update own state" ON public.driver_state;
CREATE POLICY "Drivers can update own state" ON public.driver_state FOR UPDATE USING (auth.uid() = driver_id);

-- =============================================
-- Realtime subscriptions (optional)
-- =============================================
-- Enable realtime for ride_events if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.ride_events;
-- Enable realtime for driver_state (for live tracking)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.driver_state;

COMMENT ON TABLE public.zones IS 'Geographic zones/areas in Patna';
COMMENT ON TABLE public.ride_events IS 'Driver ride lifecycle events';
COMMENT ON TABLE public.zone_visits IS 'Aggregated daily zone visit statistics';
COMMENT ON TABLE public.pings IS 'High-frequency GPS location pings';
COMMENT ON TABLE public.charges IS 'Battery charging sessions';
COMMENT ON TABLE public.context_feeds IS 'Manual driver feedback about zones';
COMMENT ON TABLE public.training_examples IS 'Pre-processed features for ML training';
COMMENT ON TABLE public.zone_context_30m IS '30-minute windowed zone activity statistics';
COMMENT ON TABLE public.driver_state IS 'Live tracking state and recommendations per driver';
