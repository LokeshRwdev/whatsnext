import { writeFileSync } from "node:fs";
import { getOpenAPIDocument } from "../lib/openapi.ts";

const doc = getOpenAPIDocument();
writeFileSync("public/openapi.json", JSON.stringify(doc, null, 2));
console.log("✅ OpenAPI spec written to public/openapi.json");
