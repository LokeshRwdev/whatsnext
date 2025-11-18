import { z } from "zod";
import { extendZodWithOpenApi, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

// Initialize OpenAPI Registry
export const registry = new OpenAPIRegistry();

// ===== Base Schemas =====

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

export const HealthSchema = z.object({
  ok: z.boolean(),
  time: z.string().datetime(),
});

// ===== Event Types =====
export const RideEventTypeSchema = z.enum([
  "booking_received",
  "ride_started",
  "ride_completed",
  "booking_cancelled",
]);

export const PlatformSchema = z.enum(["ola", "uber"]);

export const CancelReasonSchema = z.enum(["driver", "rider", "platform"]);

// ===== Entity Schemas =====

export const ZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  geohash6: z.string().nullable(),
  is_airport: z.boolean(),
  is_charger: z.boolean(),
  meta: z.record(z.any()).nullable(),
});

export const RideEventSchema = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid(),
  event_type: RideEventTypeSchema,
  occurred_at: z.string().datetime(),
  zone_id: z.string().uuid().nullable(),
  geohash6: z.string().nullable(),
  battery_pct: z.number().min(0).max(100).nullable(),
  created_at: z.string().datetime(),
});

export const ZoneVisitSchema = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid(),
  zone_id: z.string().uuid(),
  arrived_at: z.string().datetime(),
  left_at: z.string().datetime().nullable(),
  context: z.record(z.any()).nullable(),
  created_at: z.string().datetime(),
});

export const PingSchema = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid(),
  ts: z.string().datetime(),
  lat: z.number(),
  lon: z.number(),
  speed_kmh: z.number().nullable(),
  battery_pct: z.number().min(0).max(100).nullable(),
  created_at: z.string().datetime(),
});

export const ChargeSchema = z.object({
  id: z.string().uuid(),
  driver_id: z.string().uuid(),
  station_zone: z.string().uuid().nullable(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().nullable(),
  kwh: z.number().nullable(),
  cost_inr: z.number().nullable(),
  created_at: z.string().datetime(),
});

export const CityEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string().nullable(),
  venue_zone: z.string().uuid(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  impact_score: z.number().nullable(),
  created_at: z.string().datetime(),
});

// ===== Request Schemas =====

export const CreateRideEventReq = z.object({
  event_type: RideEventTypeSchema,
  occurred_at: z.string().datetime().optional(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  battery_pct: z.number().min(0).max(100).nullable().optional(),
});

export const RideEventIngestSchema = z
  .object({
    event_type: RideEventTypeSchema,
    occurred_at: z.string().datetime().optional(),
    platform: PlatformSchema.optional(),
    fare_inr: z.number().min(0).optional(),
    distance_km: z.number().min(0).optional(),
    pickup_lat: z.number().min(-90).max(90).optional(),
    pickup_lon: z.number().min(-180).max(180).optional(),
    drop_lat: z.number().min(-90).max(90).optional(),
    drop_lon: z.number().min(-180).max(180).optional(),
    surge_multiplier: z.number().min(0).max(10).optional(),
    promo_code: z.string().max(64).optional(),
    cancel_reason: CancelReasonSchema.optional(),
    deadhead_distance_km: z.number().min(0).max(200).optional(),
    deadhead_time_min: z.number().min(0).max(600).optional(),
  })
  .refine(
    (data) =>
      (data.pickup_lat === undefined && data.pickup_lon === undefined) ||
      (data.pickup_lat !== undefined && data.pickup_lon !== undefined),
    {
      message: "pickup_lat and pickup_lon must be provided together",
      path: ["pickup_lat"],
    }
  )
  .refine(
    (data) =>
      (data.drop_lat === undefined && data.drop_lon === undefined) ||
      (data.drop_lat !== undefined && data.drop_lon !== undefined),
    {
      message: "drop_lat and drop_lon must be provided together",
      path: ["drop_lat"],
    }
  )
  .refine(
    (data) =>
      data.event_type !== "booking_cancelled" || data.cancel_reason !== undefined,
    {
      message: "cancel_reason required for booking_cancelled events",
      path: ["cancel_reason"],
    }
  );

export const TripSyncReq = z.object({
  booking_at: z.string().datetime().optional(),
  pickup_at: z.string().datetime(),
  drop_at: z.string().datetime(),
  pickup_lat: z.number().min(-90).max(90),
  pickup_lon: z.number().min(-180).max(180),
  drop_lat: z.number().min(-90).max(90),
  drop_lon: z.number().min(-180).max(180),
  distance_km: z.number().min(0),
  fare_inr: z.number().min(0),
  platform: PlatformSchema,
  surge_multiplier: z.number().min(0).max(10).optional(),
  promo_code: z.string().max(64).optional(),
  deadhead_km: z.number().min(0).max(200).optional(),
  deadhead_min: z.number().min(0).max(600).optional(),
  tip_inr: z.number().min(0).optional(),
});

export const OpsDailyUpsertReq = z.object({
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "day must be YYYY-MM-DD")
    .optional(),
  platforms: z.array(PlatformSchema).min(1).optional(),
  idle_minutes: z.number().int().min(0).optional(),
  fuel_litres: z.number().min(0).optional(),
  fuel_cost_inr: z.number().min(0).optional(),
  energy_kwh: z.number().min(0).optional(),
  energy_cost_inr: z.number().min(0).optional(),
  tolls_parking_inr: z.number().min(0).optional(),
  notes: z.string().max(512).optional(),
});

export type RideEventIngestInput = z.infer<typeof RideEventIngestSchema>;
export type TripSyncInput = z.infer<typeof TripSyncReq>;
export type OpsDailyUpsertInput = z.infer<typeof OpsDailyUpsertReq>;

export const CreateZoneVisitReq = z.object({
  zone_id: z.string().uuid(),
  arrived_at: z.string().datetime().optional(),
  context: z.record(z.any()).optional(),
});

export const UpdateZoneVisitReq = z.object({
  left_at: z.string().datetime(),
});

export const CreatePingReq = z.object({
  ts: z.string().datetime().optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  accuracy_m: z.number().min(0).max(5000).nullable().optional(),
  speed_kmh: z.number().min(0).max(200).nullable().optional(),
  battery_pct: z.number().min(0).max(100).nullable().optional(),
  traffic_context: z
    .object({
      traffic_speed_idx: z.number().min(0).max(1).optional(),
      route_incident: z.boolean().optional(),
      airport_wave: z.number().min(0).max(1).optional(),
      weather_flag_rain: z.boolean().optional(),
      event_flag: z.boolean().optional(),
    })
    .optional(),
});

export const CreateChargeReq = z.object({
  station_zone: z.string().uuid().nullable().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().nullable().optional(),
  kwh: z.number().nullable().optional(),
  cost_inr: z.number().nullable().optional(),
});

export const AdminZoneReq = z.object({
  name: z.string(),
  lat: z.number(),
  lon: z.number(),
  is_airport: z.boolean().optional(),
  is_charger: z.boolean().optional(),
  meta: z.record(z.any()).optional(),
});

export const AdminEventReq = z.object({
  name: z.string(),
  category: z.string().optional(),
  venue_zone: z.string().uuid(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  impact_score: z.number().optional(),
});

// ===== Response Schemas =====

export const DataResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const CreatedResponseSchema = z.object({
  data: z.object({
    created: z.boolean(),
    id: z.string().uuid().optional(),
  }),
});

export const RecommendationSchema = z.object({
  zone_id: z.string().uuid(),
  zone_name: z.string(),
  score: z.number(),
  distance_km: z.number(),
  eta_min: z.number(),
  reason: z.string(),
});

export const DriverStateSchema = z.object({
  driver_id: z.string().uuid(),
  last_ping_at: z.string().datetime(),
  lat: z.number(),
  lon: z.number(),
  snapped_zone: z.string().uuid().nullable(),
  speed_kmh: z.number().nullable(),
  battery_pct: z.number().min(0).max(100).nullable(),
  recommendation: z.array(RecommendationSchema).nullable(),
  updated_at: z.string().datetime(),
});

export const PingResponseSchema = z.object({
  snapped_zone: z.string().uuid().nullable(),
  recommendation: z.array(RecommendationSchema),
});

export const WeatherSchema = z.object({
  hour: z.string().datetime(),
  temp_c: z.number().nullable(),
  humidity: z.number().nullable(),
  wind_kmh: z.number().nullable(),
  rain_mm: z.number().nullable(),
});

export const AirportWaveSchema = z.object({
  bucket: z.string(),
  arrival_wave: z.number().nullable(),
  departure_wave: z.number().nullable(),
});

export const HotspotSchema = z.object({
  zone_id: z.string().uuid(),
  bucket: z.string(),
  popularity_index: z.number(),
});

// ===== Register Components =====

registry.register("ApiError", ApiErrorSchema.openapi("ApiError"));
registry.register("Health", HealthSchema.openapi("Health"));
registry.register("Zone", ZoneSchema.openapi("Zone"));
registry.register("RideEvent", RideEventSchema.openapi("RideEvent"));
registry.register("ZoneVisit", ZoneVisitSchema.openapi("ZoneVisit"));
registry.register("Ping", PingSchema.openapi("Ping"));
registry.register("Charge", ChargeSchema.openapi("Charge"));
registry.register("CityEvent", CityEventSchema.openapi("CityEvent"));
registry.register("Recommendation", RecommendationSchema.openapi("Recommendation"));
registry.register("DriverState", DriverStateSchema.openapi("DriverState"));
registry.register("PingResponse", PingResponseSchema.openapi("PingResponse"));
registry.register("Weather", WeatherSchema.openapi("Weather"));
registry.register("AirportWave", AirportWaveSchema.openapi("AirportWave"));
registry.register("Hotspot", HotspotSchema.openapi("Hotspot"));

registry.register("CreateRideEventReq", CreateRideEventReq.openapi("CreateRideEventReq"));
registry.register("CreateZoneVisitReq", CreateZoneVisitReq.openapi("CreateZoneVisitReq"));
registry.register("UpdateZoneVisitReq", UpdateZoneVisitReq.openapi("UpdateZoneVisitReq"));
registry.register("CreatePingReq", CreatePingReq.openapi("CreatePingReq"));
registry.register("CreateChargeReq", CreateChargeReq.openapi("CreateChargeReq"));
registry.register("AdminZoneReq", AdminZoneReq.openapi("AdminZoneReq"));
registry.register("AdminEventReq", AdminEventReq.openapi("AdminEventReq"));

// ===== Register Paths =====

// Health
registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["System"],
  summary: "Health check",
  responses: {
    200: {
      description: "System is healthy",
      content: {
        "application/json": {
          schema: DataResponseSchema(HealthSchema),
        },
      },
    },
  },
});

// Zones
registry.registerPath({
  method: "get",
  path: "/api/zones",
  tags: ["Zones"],
  summary: "List all zones",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of zones",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(ZoneSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Ride Events
registry.registerPath({
  method: "post",
  path: "/api/ride-events",
  tags: ["Ride Events"],
  summary: "Create a ride event",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateRideEventReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ride event created",
      content: {
        "application/json": {
          schema: CreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/ride-events",
  tags: ["Ride Events"],
  summary: "List own ride events",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of ride events",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(RideEventSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/ride-events/{id}",
  tags: ["Ride Events"],
  summary: "Get a ride event by ID",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Ride event details",
      content: {
        "application/json": {
          schema: DataResponseSchema(RideEventSchema),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Zone Visits
registry.registerPath({
  method: "post",
  path: "/api/zone-visits",
  tags: ["Zone Visits"],
  summary: "Create a zone visit",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateZoneVisitReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Zone visit created",
      content: {
        "application/json": {
          schema: CreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/zone-visits",
  tags: ["Zone Visits"],
  summary: "List own zone visits",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of zone visits",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(ZoneVisitSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/zone-visits/{id}",
  tags: ["Zone Visits"],
  summary: "Update zone visit left_at",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateZoneVisitReq,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Zone visit updated",
      content: {
        "application/json": {
          schema: DataResponseSchema(ZoneVisitSchema),
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Pings
registry.registerPath({
  method: "post",
  path: "/api/pings",
  tags: ["Tracking"],
  summary: "Submit GPS ping and receive recommendations",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePingReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Ping processed, recommendations computed",
      content: {
        "application/json": {
          schema: DataResponseSchema(PingResponseSchema),
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Charges
registry.registerPath({
  method: "post",
  path: "/api/charges",
  tags: ["Charges"],
  summary: "Create a charge record",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateChargeReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Charge created",
      content: {
        "application/json": {
          schema: CreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/charges",
  tags: ["Charges"],
  summary: "List own charges",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "List of charges",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(ChargeSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Context APIs
registry.registerPath({
  method: "get",
  path: "/api/context/weather",
  tags: ["Context"],
  summary: "Get latest weather observation",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Latest weather data",
      content: {
        "application/json": {
          schema: DataResponseSchema(WeatherSchema.nullable()),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/context/airport-wave",
  tags: ["Context"],
  summary: "Get current airport wave data",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Airport wave data",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(AirportWaveSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/context/hotspot",
  tags: ["Context"],
  summary: "Get zone hotspot popularity",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      zone_id: z.string().uuid().optional(),
      bucket: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Hotspot data",
      content: {
        "application/json": {
          schema: DataResponseSchema(HotspotSchema.nullable()),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Recommendations
registry.registerPath({
  method: "get",
  path: "/api/recommendations/next-spot",
  tags: ["Recommendations"],
  summary: "Get top recommended zones with ETA and distance",
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      lat: z.string().optional(),
      lon: z.string().optional(),
      limit: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: "Recommended zones with scores, distance, and ETA",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(RecommendationSchema)),
        },
      },
    },
    400: {
      description: "Missing or invalid coordinates",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Driver State
registry.registerPath({
  method: "get",
  path: "/api/driver-state",
  tags: ["Tracking"],
  summary: "Get current driver state and cached recommendations",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "Current driver state",
      content: {
        "application/json": {
          schema: DataResponseSchema(DriverStateSchema),
        },
      },
    },
    204: {
      description: "No state available (new driver)",
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Admin - Zones
registry.registerPath({
  method: "post",
  path: "/api/admin/zones",
  tags: ["Admin"],
  summary: "Create a zone (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AdminZoneReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Zone created",
      content: {
        "application/json": {
          schema: CreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - admin only",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/admin/zones",
  tags: ["Admin"],
  summary: "List all zones (admin)",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: "List of zones",
      content: {
        "application/json": {
          schema: DataResponseSchema(z.array(ZoneSchema)),
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - admin only",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/admin/zones/{id}",
  tags: ["Admin"],
  summary: "Update a zone (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: AdminZoneReq.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Zone updated",
      content: {
        "application/json": {
          schema: DataResponseSchema(ZoneSchema),
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - admin only",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

// Admin - Events
registry.registerPath({
  method: "post",
  path: "/api/admin/events",
  tags: ["Admin"],
  summary: "Create a city event (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AdminEventReq,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Event created",
      content: {
        "application/json": {
          schema: CreatedResponseSchema,
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - admin only",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/admin/events/{id}",
  tags: ["Admin"],
  summary: "Update a city event (admin only)",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: AdminEventReq.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Event updated",
      content: {
        "application/json": {
          schema: DataResponseSchema(CityEventSchema),
        },
      },
    },
    400: {
      description: "Validation error",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    403: {
      description: "Forbidden - admin only",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
    404: {
      description: "Not found",
      content: {
        "application/json": {
          schema: ApiErrorSchema,
        },
      },
    },
  },
});
