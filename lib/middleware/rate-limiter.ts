/**
 * Rate limiting middleware
 */

import { NextRequest } from 'next/server'
import { RateLimitError } from './error-handler'
import { RATE_LIMITS } from '@/lib/config/api'

// ============================================
// In-Memory Rate Limit Store
// ============================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, 60 * 1000) // Clean every minute

// ============================================
// Rate Limiter
// ============================================

export interface RateLimitConfig {
  requestsPerMinute: number
  windowMs: number
  keyGenerator?: (request: NextRequest) => string
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<void> => {
    const key = config.keyGenerator
      ? config.keyGenerator(request)
      : getDefaultKey(request)

    const now = Date.now()
    const entry = store.get(key)

    // No entry or window expired - create new entry
    if (!entry || entry.resetAt <= now) {
      store.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      })
      return
    }

    // Increment counter
    entry.count++

    // Check if rate limit exceeded
    if (entry.count > config.requestsPerMinute) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`
      )
    }

    store.set(key, entry)
  }
}

/**
 * Default key generator (IP + path)
 */
function getDefaultKey(request: NextRequest): string {
  const ip = getClientIp(request)
  const path = new URL(request.url).pathname
  return `${ip}:${path}`
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  // Check various headers that might contain the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }

  if (realIp) {
    return realIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/**
 * Global rate limiter
 */
export const globalRateLimiter = createRateLimiter({
  requestsPerMinute: RATE_LIMITS.GLOBAL.REQUESTS_PER_MINUTE,
  windowMs: RATE_LIMITS.GLOBAL.WINDOW_MS,
})

/**
 * Endpoint-specific rate limiters
 */
export const endpointRateLimiters: Record<string, ReturnType<typeof createRateLimiter>> = {}

for (const [path, config] of Object.entries(RATE_LIMITS.ENDPOINTS)) {
  endpointRateLimiters[path] = createRateLimiter({
    requestsPerMinute: config.REQUESTS_PER_MINUTE,
    windowMs: config.WINDOW_MS,
  })
}

/**
 * Get rate limiter for endpoint
 */
export function getRateLimiter(path: string) {
  return endpointRateLimiters[path] || globalRateLimiter
}

// ============================================
// Authenticated User Rate Limiting
// ============================================

/**
 * Create rate limiter with authentication multiplier
 */
export function createAuthRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest, userId?: string): Promise<void> => {
    const multiplier = userId ? RATE_LIMITS.AUTHENTICATED_MULTIPLIER : 1
    const adjustedConfig = {
      ...config,
      requestsPerMinute: config.requestsPerMinute * multiplier,
    }

    const limiter = createRateLimiter(adjustedConfig)
    await limiter(request)
  }
}

// ============================================
// Rate Limit Headers
// ============================================

export interface RateLimitHeaders {
  'X-RateLimit-Limit': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitHeaders {
  const key = config.keyGenerator
    ? config.keyGenerator(request)
    : getDefaultKey(request)

  const entry = store.get(key)

  if (!entry) {
    return {
      'X-RateLimit-Limit': config.requestsPerMinute.toString(),
      'X-RateLimit-Remaining': config.requestsPerMinute.toString(),
      'X-RateLimit-Reset': new Date(
        Date.now() + config.windowMs
      ).toISOString(),
    }
  }

  return {
    'X-RateLimit-Limit': config.requestsPerMinute.toString(),
    'X-RateLimit-Remaining': Math.max(
      0,
      config.requestsPerMinute - entry.count
    ).toString(),
    'X-RateLimit-Reset': new Date(entry.resetAt).toISOString(),
  }
}

// ============================================
// Bypass Rate Limiting (for cron jobs, etc.)
// ============================================

/**
 * Check if request should bypass rate limiting
 */
export function shouldBypassRateLimit(request: NextRequest): boolean {
  // Bypass for Vercel Cron
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }

  // Bypass for admin API key
  const adminKey = process.env.ADMIN_API_KEY
  const apiKey = request.headers.get('x-api-key')

  if (adminKey && apiKey === adminKey) {
    return true
  }

  return false
}
