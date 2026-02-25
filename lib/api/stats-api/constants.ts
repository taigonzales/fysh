/**
 * Constants for Stats API integration
 */

export const STATS_API_CONFIG = {
  BASE_URL: process.env.STATS_API_BASE_URL || 'https://v1.basketball.api-sports.io',
  API_KEY: process.env.STATS_API_KEY || '',
  DAILY_LIMIT: 500,
  TIMEOUT_MS: 10000,
  CACHE_TTL_HOURS: 12,
} as const

// Sport-specific API endpoints
export const SPORT_ENDPOINTS: Record<string, string> = {
  NBA: 'https://v1.basketball.api-sports.io',
  NHL: 'https://v1.hockey.api-sports.io',
  NFL: 'https://v1.american-football.api-sports.io',
  MLB: 'https://v1.baseball.api-sports.io',
  NCAAB: 'https://v1.basketball.api-sports.io', // Same as NBA
}

// Sport-specific stat fields
export const STAT_FIELDS_BY_SPORT: Record<string, string[]> = {
  NBA: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'minutes'],
  NHL: ['goals', 'assists', 'points', 'shots', 'hits', 'timeOnIce'],
  NFL: ['passingYards', 'rushingYards', 'receivingYards', 'touchdowns'],
  MLB: ['hits', 'homeRuns', 'rbis', 'stolenBases', 'strikeouts'],
  NCAAB: ['points', 'rebounds', 'assists', 'steals', 'blocks', 'minutes'],
}
