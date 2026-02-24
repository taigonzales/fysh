// Re-export Prisma types
export * from '@prisma/client'

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

// Sport Types
export type SportType = 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'

// Market Types
export type MarketType = 'SPREAD' | 'MONEYLINE' | 'TOTAL'

// Pick Stats
export interface PickStats {
  totalPicks: number
  wins: number
  losses: number
  pushes: number
  winRate: number
  roi: number
}

// Leaderboard Entry
export interface LeaderboardEntry {
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  totalPicks: number
  winRate: number
  roi: number
  currentStreak: number
}

// Prop with Hit Rates
export interface PropWithAnalysis {
  id: string
  playerName: string
  propType: string
  line: number
  overOdds: number
  underOdds: number
  hitRateLast5?: number
  hitRateLast10?: number
  hitRateSeason?: number
  aiAnalysis?: string
}
