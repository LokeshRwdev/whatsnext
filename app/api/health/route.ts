import { ok } from "@/lib/api-respond";

export async function GET() {
  return ok({
    ok: true,
    time: new Date().toISOString(),
  });
}
