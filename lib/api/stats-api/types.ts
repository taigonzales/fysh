/**
 * Type definitions for Stats API (API-SPORTS)
 */

export interface GameLog {
  date: string
  opponent: string
  isHome: boolean
  points?: number
  rebounds?: number
  assists?: number
  minutes?: number
  // Additional stats fields
  [key: string]: number | string | boolean | undefined
}

export interface SeasonAverage {
  points: number
  rebounds: number
  assists: number
  minutes: number
  gamesPlayed: number
  // Additional averages
  [key: string]: number
}

export interface SituationalSplits {
  home: SeasonAverage
  away: SeasonAverage
  lastNGames: {
    n: number
    average: SeasonAverage
  }
}

export interface PlayerSeasonData {
  playerName: string
  sport: string
  season: string
  teamName: string
  gamesPlayed: number
  seasonAvg: SeasonAverage
  last25Games: GameLog[]
  homeAway: {
    home: Partial<SeasonAverage>
    away: Partial<SeasonAverage>
  }
  vsOpponents: Record<string, GameLog[]>
}

export interface StatsApiResponse<T = unknown> {
  success: boolean
  data: T
  error?: string
}

export interface RateLimitInfo {
  requestsToday: number
  dailyLimit: number
  resetAt: Date
}
