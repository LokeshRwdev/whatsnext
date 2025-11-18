import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./zod-schemas";

export function getOpenAPIDocument() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Patna EV Co-Pilot API",
      version: "1.0.0",
      description:
        "REST API for the Patna EV Co-Pilot driver assistance application. Provides endpoints for ride event tracking, zone management, context data, and recommendations.",
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
  });

  // Add security schemes after generation
  if (!document.components) {
    document.components = {};
  }
  document.components.securitySchemes = {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Supabase JWT token from authentication",
    },
  };

  return document;
}
