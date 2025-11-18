"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function DocsPage() {
  return (
    <div style={{ height: "100dvh" }}>
      <SwaggerUI url="/api/openapi" />
    </div>
  );
}
