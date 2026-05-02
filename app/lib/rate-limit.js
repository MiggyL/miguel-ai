// Best-effort in-memory rate limit keyed by IP. On serverless platforms
// instances are short-lived and not shared, so the practical effect is
// "5 requests per hour per warm instance per IP" — enough to deter casual
// abuse without standing up Redis. For real protection, swap in a KV
// store (e.g. Upstash) and key off this same shape.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;

const buckets = new Map(); // ip -> [timestamps]

export function checkRateLimit(ip) {
  if (!ip) ip = 'unknown';
  const now = Date.now();
  const recent = (buckets.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0];
    const retryAfterMs = WINDOW_MS - (now - oldest);
    return {
      allowed: false,
      retryAfterMs,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
    };
  }
  recent.push(now);
  buckets.set(ip, recent);
  return { allowed: true, remaining: MAX_REQUESTS - recent.length };
}

export function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  // Next.js does not expose the socket directly in the new edge/server APIs.
  return 'unknown';
}
