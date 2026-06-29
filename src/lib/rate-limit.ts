/**
 * Simple in-memory rate limiter for API routes.
 *
 * Note: This works for single-instance deployments. For multi-instance
 * or serverless (Vercel), consider upgrading to @upstash/ratelimit with Redis.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // seconds until the window resets
}

/**
 * Check rate limit for a given identifier (IP, email, etc.)
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = identifier

  const entry = rateLimitStore.get(key)

  // No existing entry or window expired — allow and start new window
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    }
  }

  // Within window — check count
  if (entry.count >= config.maxRequests) {
    const resetIn = Math.ceil((entry.resetTime - now) / 1000)
    return {
      success: false,
      remaining: 0,
      resetIn,
    }
  }

  // Within window, under limit — increment
  entry.count++
  const resetIn = Math.ceil((entry.resetTime - now) / 1000)

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn,
  }
}

/**
 * Extract client IP from request headers.
 * Works with most reverse proxies (Vercel, Cloudflare, nginx).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback — in production behind a proxy this shouldn't happen
  return "unknown"
}

/** Rate limit configs for different auth operations */
export const AUTH_RATE_LIMITS = {
  /** Login: 5 attempts per 60 seconds per IP */
  login: { maxRequests: 5, windowSeconds: 60 },
  /** Signup: 3 attempts per 60 seconds per IP */
  signup: { maxRequests: 3, windowSeconds: 60 },
  /** Forgot password: 3 attempts per 300 seconds (5 min) per IP */
  forgotPassword: { maxRequests: 3, windowSeconds: 300 },
  /** Resend verification: 2 attempts per 60 seconds per IP */
  resendVerification: { maxRequests: 2, windowSeconds: 60 },
  /** Reset password: 5 attempts per 300 seconds per IP */
  resetPassword: { maxRequests: 5, windowSeconds: 300 },
  /** Verify email: 5 attempts per 60 seconds per IP */
  verifyEmail: { maxRequests: 5, windowSeconds: 60 },
} as const
