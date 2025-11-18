import { getOpenAPIDocument } from "@/lib/openapi";

export async function GET() {
  const document = getOpenAPIDocument();
  return Response.json(document);
}
