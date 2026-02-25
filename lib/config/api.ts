/**
 * API configuration - rate limits, timeouts, retries
 */

// ============================================
// API Timeouts
// ============================================

export const API_TIMEOUTS = {
  // Request timeouts (ms)
  DEFAULT: 10000, // 10 seconds
  SYNC: 60000, // 60 seconds for sync operations
  EXTERNAL_API: 15000, // 15 seconds for external APIs

  // Database timeouts
  DB_QUERY: 5000,
  DB_TRANSACTION: 10000,
} as const

// ============================================
// Retry Configuration
// ============================================

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2, // Exponential backoff
} as const

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(attempt: number): number {
  const delay =
    RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt)
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY)
}

// ============================================
// Rate Limiting (Internal API)
// ============================================

export const RATE_LIMITS = {
  // Global rate limit
  GLOBAL: {
    REQUESTS_PER_MINUTE: 100,
    WINDOW_MS: 60 * 1000,
  },

  // Per-endpoint limits
  ENDPOINTS: {
    '/api/games': {
      REQUESTS_PER_MINUTE: 60,
      WINDOW_MS: 60 * 1000,
    },
    '/api/odds': {
      REQUESTS_PER_MINUTE: 30,
      WINDOW_MS: 60 * 1000,
    },
    '/api/props': {
      REQUESTS_PER_MINUTE: 30,
      WINDOW_MS: 60 * 1000,
    },
    '/api/sync/trigger': {
      REQUESTS_PER_MINUTE: 5,
      WINDOW_MS: 60 * 1000,
    },
  },

  // Authenticated users get higher limits
  AUTHENTICATED_MULTIPLIER: 5,
} as const

// ============================================
// Pagination
// ============================================

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  MAX_OFFSET: 10000, // Prevent deep pagination
} as const

/**
 * Validate and normalize pagination params
 */
export function normalizePagination(limit?: number, offset?: number) {
  const normalizedLimit = Math.min(
    limit || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  )

  const normalizedOffset = Math.min(offset || 0, PAGINATION.MAX_OFFSET)

  return {
    limit: normalizedLimit,
    offset: normalizedOffset,
  }
}

// ============================================
// CORS Configuration
// ============================================

export const CORS_CONFIG = {
  ALLOWED_ORIGINS: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : null,
  ].filter(Boolean) as string[],

  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
  MAX_AGE: 86400, // 24 hours
} as const

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (process.env.NODE_ENV === 'development') return true
  return CORS_CONFIG.ALLOWED_ORIGINS.includes(origin)
}

// ============================================
// Cache Control
// ============================================

export const CACHE_CONTROL = {
  // Static assets
  STATIC: 'public, max-age=31536000, immutable',

  // API responses
  API: {
    GAMES: 'public, max-age=300, s-maxage=300', // 5 minutes
    ODDS: 'public, max-age=120, s-maxage=120', // 2 minutes
    PROPS: 'public, max-age=300, s-maxage=300', // 5 minutes
    NO_CACHE: 'no-store, must-revalidate',
  },
} as const

// ============================================
// Error Handling
// ============================================

export const ERROR_CODES = {
  // Client errors (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,

  // Server errors (5xx)
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

export const ERROR_MESSAGES = {
  [ERROR_CODES.BAD_REQUEST]: 'Invalid request parameters',
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  [ERROR_CODES.FORBIDDEN]: 'Access denied',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.CONFLICT]: 'Resource conflict',
  [ERROR_CODES.RATE_LIMITED]: 'Rate limit exceeded',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
  [ERROR_CODES.BAD_GATEWAY]: 'Bad gateway',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service unavailable',
  [ERROR_CODES.GATEWAY_TIMEOUT]: 'Gateway timeout',
} as const
