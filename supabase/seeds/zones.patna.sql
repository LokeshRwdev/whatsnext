-- Patna Zone Seeds
-- Major landmarks and areas in Patna

INSERT INTO public.zones (
  slug,
  name,
  lat,
  lon,
  center,
  radius_km,
  weight_demand,
  weight_airport,
  is_active
) VALUES
  (
    'patna_airport',
    'Patna Airport',
    25.5913,
    85.0880,
    ST_SetSRID(ST_MakePoint(85.0880, 25.5913), 4326)::geography,
    4.0,
    1.15,
    1.2,
    TRUE
  ),
  (
    'patna_pm_mall',
    'P&M Mall',
    25.6093,
    85.1376,
    ST_SetSRID(ST_MakePoint(85.1376, 25.6093), 4326)::geography,
    2.5,
    1.05,
    0,
    TRUE
  ),
  (
    'patna_dak_bungalow',
    'Dak Bungalow',
    25.61,
    85.14,
    ST_SetSRID(ST_MakePoint(85.14, 25.61), 4326)::geography,
    2.5,
    1.1,
    0,
    TRUE
  ),
  (
    'patna_junction',
    'Patna Junction',
    25.5941,
    85.1376,
    ST_SetSRID(ST_MakePoint(85.1376, 25.5941), 4326)::geography,
    2.8,
    1.15,
    0,
    TRUE
  ),
  (
    'patna_gandhi_maidan',
    'Gandhi Maidan',
    25.6123,
    85.1445,
    ST_SetSRID(ST_MakePoint(85.1445, 25.6123), 4326)::geography,
    2.4,
    1.1,
    0,
    TRUE
  ),
  (
    'patna_exhibition_road',
    'Exhibition Road',
    25.605,
    85.151,
    ST_SetSRID(ST_MakePoint(85.151, 25.605), 4326)::geography,
    2.5,
    1.08,
    0,
    TRUE
  ),
  (
    'patna_boring_road',
    'Boring Road',
    25.595,
    85.17,
    ST_SetSRID(ST_MakePoint(85.17, 25.595), 4326)::geography,
    3.0,
    1.05,
    0,
    TRUE
  ),
  (
    'patna_saguna_more',
    'Saguna More',
    25.596,
    85.19,
    ST_SetSRID(ST_MakePoint(85.19, 25.596), 4326)::geography,
    3.0,
    1.0,
    0,
    TRUE
  ),
  (
    'patna_danapur',
    'Danapur',
    25.63,
    85.05,
    ST_SetSRID(ST_MakePoint(85.05, 25.63), 4326)::geography,
    3.5,
    0.95,
    0,
    TRUE
  ),
  (
    'patna_kankarbagh',
    'Kankarbagh',
    25.58,
    85.165,
    ST_SetSRID(ST_MakePoint(85.165, 25.58), 4326)::geography,
    3.0,
    1.05,
    0,
    TRUE
  ),
  (
    'patna_rajendra_nagar',
    'Rajendra Nagar',
    25.585,
    85.175,
    ST_SetSRID(ST_MakePoint(85.175, 25.585), 4326)::geography,
    2.8,
    1.0,
    0,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  lat = EXCLUDED.lat,
  lon = EXCLUDED.lon,
  center = EXCLUDED.center,
  radius_km = EXCLUDED.radius_km,
  weight_demand = EXCLUDED.weight_demand,
  weight_airport = EXCLUDED.weight_airport,
  is_active = EXCLUDED.is_active;
