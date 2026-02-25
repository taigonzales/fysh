/**
 * Stats API Client for API-SPORTS integration
 */
import axios, { type AxiosInstance } from 'axios'
import { STATS_API_CONFIG, SPORT_ENDPOINTS } from './constants'
import type {
  GameLog,
  PlayerSeasonData,
  SeasonAverage,
  RateLimitInfo,
} from './types'

export class StatsApiClient {
  private axios: AxiosInstance
  private requestsToday: number = 0
  private lastResetDate: Date = new Date()

  constructor() {
    this.axios = axios.create({
      baseURL: STATS_API_CONFIG.BASE_URL,
      timeout: STATS_API_CONFIG.TIMEOUT_MS,
      headers: {
        'x-rapidapi-key': STATS_API_CONFIG.API_KEY,
        'x-rapidapi-host': this.getHostFromUrl(STATS_API_CONFIG.BASE_URL),
      },
    })

    this.resetRateLimitIfNeeded()
  }

  private getHostFromUrl(url: string): string {
    return new URL(url).hostname
  }

  private resetRateLimitIfNeeded(): void {
    const now = new Date()
    const lastReset = this.lastResetDate

    // Reset at midnight
    if (now.getDate() !== lastReset.getDate()) {
      this.requestsToday = 0
      this.lastResetDate = now
    }
  }

  private trackRequest(): void {
    this.resetRateLimitIfNeeded()
    this.requestsToday++
  }

  getRateLimitInfo(): RateLimitInfo {
    this.resetRateLimitIfNeeded()

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return {
      requestsToday: this.requestsToday,
      dailyLimit: STATS_API_CONFIG.DAILY_LIMIT,
      resetAt: tomorrow,
    }
  }

  async getPlayerSeasonStats(
    playerName: string,
    sport: string,
    season: string
  ): Promise<PlayerSeasonData> {
    this.trackRequest()

    // Mock implementation for now
    // TODO: Replace with actual API call
    return {
      playerName,
      sport,
      season,
      teamName: 'Mock Team',
      gamesPlayed: 50,
      seasonAvg: {
        points: 25.5,
        rebounds: 7.2,
        assists: 8.1,
        minutes: 35.2,
        gamesPlayed: 50,
      },
      last25Games: [],
      homeAway: {
        home: { points: 26.3, rebounds: 7.5, assists: 8.3 },
        away: { points: 24.7, rebounds: 6.9, assists: 7.9 },
      },
      vsOpponents: {},
    }
  }

  async getPlayerRecentGames(
    playerName: string,
    sport: string,
    lastN: number
  ): Promise<GameLog[]> {
    this.trackRequest()

    // Mock implementation for now
    // TODO: Replace with actual API call
    return []
  }

  hasQuota(requestsNeeded: number = 1): boolean {
    const { requestsToday, dailyLimit } = this.getRateLimitInfo()
    return requestsToday + requestsNeeded <= dailyLimit
  }
}

// Export singleton instance
export const statsApiClient = new StatsApiClient()
