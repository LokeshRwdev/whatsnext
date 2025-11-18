const MAP = new Map<string, { count: number; ts: number }>();

export function rateLimit(ip: string, limit = 60, windowMs = 60000) {
  const now = Date.now();
  const rec = MAP.get(ip) || { count: 0, ts: now };
  
  if (now - rec.ts > windowMs) {
    rec.count = 0;
    rec.ts = now;
  }
  
  rec.count += 1;
  MAP.set(ip, rec);
  
  return {
    allowed: rec.count <= limit,
    remaining: Math.max(0, limit - rec.count),
  };
}
