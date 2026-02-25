/**
 * HTTP client for The Odds API v4 with rate limiting and retry logic
 */

import type {
  OddsApiSport,
  OddsApiEvent,
  FetchOddsParams,
  FetchPlayerPropsParams,
  ApiRateLimitInfo,
  OddsApiError,
} from './types'
import { API_CONFIG, RATE_LIMIT_CONFIG, PRIORITY_BOOKMAKERS } from './constants'

// ============================================
// Rate Limit Tracking
// ============================================

let rateLimitInfo: ApiRateLimitInfo = {
  requestsRemaining: RATE_LIMIT_CONFIG.MONTHLY_QUOTA,
  requestsUsed: 0,
}

export function getRateLimitInfo(): ApiRateLimitInfo {
  return { ...rateLimitInfo }
}

export function hasRateLimitQuota(minRequired: number = 1): boolean {
  return rateLimitInfo.requestsRemaining >= minRequired
}

export function shouldBlockRequest(): boolean {
  return rateLimitInfo.requestsRemaining < RATE_LIMIT_CONFIG.CRITICAL_THRESHOLD
}

function updateRateLimitFromHeaders(headers: Headers): void {
  const remaining = headers.get(RATE_LIMIT_CONFIG.TRACK_HEADER)
  const used = headers.get('x-requests-used')

  if (remaining) {
    rateLimitInfo.requestsRemaining = parseInt(remaining, 10)
  }
  if (used) {
    rateLimitInfo.requestsUsed = parseInt(used, 10)
  }

  // Log warning if approaching limit
  if (rateLimitInfo.requestsRemaining <= RATE_LIMIT_CONFIG.WARNING_THRESHOLD) {
    console.warn(
      `[OddsAPI] Rate limit warning: ${rateLimitInfo.requestsRemaining} requests remaining`
    )
  }
}

// ============================================
// HTTP Client
// ============================================

class OddsApiClient {
  private baseUrl: string
  private timeout: number
  private maxRetries: number

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
    this.maxRetries = API_CONFIG.MAX_RETRIES
  }

  /**
   * Get API key (lazy load from environment)
   */
  private getApiKey(): string {
    return process.env.ODDS_API_KEY || ''
  }

  /**
   * Make HTTP request with retry logic and rate limit tracking
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const apiKey = this.getApiKey()

    if (!apiKey) {
      throw this.createError('API key not configured', 401, endpoint)
    }

    // Check rate limit before making request
    if (shouldBlockRequest()) {
      throw this.createError(
        `Rate limit critical: ${rateLimitInfo.requestsRemaining} requests remaining`,
        429,
        endpoint
      )
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    url.searchParams.set('apiKey', apiKey)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      }
    })

    let lastError: OddsApiError | null = null

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        })

        clearTimeout(timeoutId)

        // Track rate limit
        updateRateLimitFromHeaders(response.headers)

        // Handle HTTP errors
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')

          if (response.status === 401) {
            throw this.createError('Invalid API key', 401, endpoint)
          }

          if (response.status === 429) {
            // Rate limited - wait and retry
            const retryDelay = this.getRetryDelay(attempt)
            console.warn(`[OddsAPI] Rate limited. Retrying in ${retryDelay}ms...`)
            await this.sleep(retryDelay)
            continue
          }

          if (response.status >= 500) {
            // Server error - retry
            const retryDelay = this.getRetryDelay(attempt)
            console.warn(
              `[OddsAPI] Server error ${response.status}. Retrying in ${retryDelay}ms...`
            )
            await this.sleep(retryDelay)
            continue
          }

          throw this.createError(
            `API request failed: ${errorText}`,
            response.status,
            endpoint
          )
        }

        const data = await response.json()
        return data as T
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = this.createError('Request timeout', 408, endpoint)
        } else if (error && typeof error === 'object' && 'statusCode' in error) {
          // Already an OddsApiError
          throw error
        } else {
          lastError = this.createError(
            `Network error: ${error instanceof Error ? error.message : 'Unknown'}`,
            0,
            endpoint
          )
        }

        // Retry on network errors
        if (attempt < this.maxRetries - 1) {
          const retryDelay = this.getRetryDelay(attempt)
          console.warn(`[OddsAPI] ${lastError.message}. Retrying in ${retryDelay}ms...`)
          await this.sleep(retryDelay)
        }
      }
    }

    // All retries exhausted
    throw lastError || this.createError('Request failed after retries', 0, endpoint)
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(attempt: number): number {
    return API_CONFIG.RETRY_DELAY * Math.pow(2, attempt)
  }

  /**
   * Sleep helper for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Create standardized error object
   */
  private createError(
    message: string,
    statusCode?: number,
    endpoint?: string
  ): OddsApiError {
    return {
      message,
      statusCode,
      endpoint,
      timestamp: new Date(),
    }
  }

  // ============================================
  // Public API Methods
  // ============================================

  /**
   * Get list of all available sports
   * NOTE: This endpoint is free and doesn't consume quota
   */
  async getSports(): Promise<OddsApiSport[]> {
    return this.request<OddsApiSport[]>('/sports')
  }

  /**
   * Get odds for a specific sport
   */
  async getOdds(params: FetchOddsParams): Promise<OddsApiEvent[]> {
    const queryParams: Record<string, string> = {
      regions: (params.regions || API_CONFIG.REGIONS).join(','),
      markets: (params.markets || ['h2h', 'spreads', 'totals']).join(','),
      oddsFormat: params.oddsFormat || API_CONFIG.ODDS_FORMAT,
      dateFormat: params.dateFormat || API_CONFIG.DATE_FORMAT,
    }

    // Enable QuickSlip deep links if requested
    if (params.includeLinks) {
      queryParams.includeLinks = 'true'
    }

    // Filter to priority bookmakers if specified
    if (params.bookmakers && params.bookmakers.length > 0) {
      queryParams.bookmakers = params.bookmakers.join(',')
    } else {
      queryParams.bookmakers = PRIORITY_BOOKMAKERS.join(',')
    }

    return this.request<OddsApiEvent[]>(`/sports/${params.sport}/odds`, queryParams)
  }

  /**
   * Get odds for a specific event
   */
  async getEventOdds(
    sport: string,
    eventId: string,
    params: Partial<FetchOddsParams> = {}
  ): Promise<OddsApiEvent> {
    const queryParams: Record<string, string> = {
      regions: (params.regions || API_CONFIG.REGIONS).join(','),
      markets: (params.markets || ['h2h', 'spreads', 'totals']).join(','),
      oddsFormat: params.oddsFormat || API_CONFIG.ODDS_FORMAT,
      dateFormat: params.dateFormat || API_CONFIG.DATE_FORMAT,
    }

    if (params.includeLinks) {
      queryParams.includeLinks = 'true'
    }

    if (params.bookmakers && params.bookmakers.length > 0) {
      queryParams.bookmakers = params.bookmakers.join(',')
    } else {
      queryParams.bookmakers = PRIORITY_BOOKMAKERS.join(',')
    }

    return this.request<OddsApiEvent>(
      `/sports/${sport}/events/${eventId}/odds`,
      queryParams
    )
  }

  /**
   * Get player props for an event
   */
  async getPlayerProps(params: FetchPlayerPropsParams): Promise<OddsApiEvent> {
    const queryParams: Record<string, string> = {
      regions: (params.regions || API_CONFIG.REGIONS).join(','),
      markets: (params.markets || []).join(','),
      oddsFormat: params.oddsFormat || API_CONFIG.ODDS_FORMAT,
    }

    if (params.includeLinks) {
      queryParams.includeLinks = 'true'
    }

    if (params.bookmakers && params.bookmakers.length > 0) {
      queryParams.bookmakers = params.bookmakers.join(',')
    }

    return this.request<OddsApiEvent>(
      `/sports/${params.sport}/events/${params.eventId}/odds`,
      queryParams
    )
  }

  /**
   * Get all events for a sport (no odds, just schedules)
   * This is lighter than getOdds when you only need game info
   */
  async getEvents(sport: string): Promise<OddsApiEvent[]> {
    return this.request<OddsApiEvent[]>(`/sports/${sport}/events`, {
      dateFormat: API_CONFIG.DATE_FORMAT,
    })
  }
}

// ============================================
// Singleton Export
// ============================================

export const oddsApiClient = new OddsApiClient()
