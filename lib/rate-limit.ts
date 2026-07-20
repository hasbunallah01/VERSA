/**
 * lib/rate-limit.ts — a minimal per-IP rate limiter for the free web
 * endpoint (/api/portrait).
 *
 * The paid MCP endpoint (/api/mcp) doesn't need this — every call there
 * already costs the caller real money via x402, which is its own
 * natural rate limiter. This one exists purely to bound the FREE
 * website's exposure to a burst of traffic (bots, scrapers, or repeated
 * accidental testing) hammering an endpoint that calls a paid LLM API.
 *
 * Implementation: an in-memory sliding-window counter keyed by client
 * IP. This is intentionally simple, not bulletproof — a determined,
 * distributed attacker could get around a per-instance limit, since
 * each serverless instance keeps its own counter and counters reset on
 * cold start. That tradeoff is fine here: the goal is to stop the
 * realistic cases (one bot, one bad script, one enthusiastic tester),
 * not to defend against a coordinated attack. A shared store (Vercel
 * KV/Redis) would close that gap if it's ever actually needed.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 3;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
};

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Checks and records one request for the given key (typically the
 * client IP). Returns whether it's allowed under the window, and if
 * not, how many seconds until the caller can try again.
 */
export const checkRateLimit = (key: string): RateLimitResult => {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count < MAX_REQUESTS) {
    existing.count += 1;
    return { allowed: true };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
};
