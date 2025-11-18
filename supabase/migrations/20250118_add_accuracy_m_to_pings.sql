-- Add accuracy column for GPS pings
ALTER TABLE public.pings
ADD COLUMN IF NOT EXISTS accuracy_m DOUBLE PRECISION;

COMMENT ON COLUMN public.pings.accuracy_m IS 'GPS accuracy in meters for this ping';
