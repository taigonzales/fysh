/**
 * React Query hooks for odds data
 */

import { useQuery } from '@tanstack/react-query'
import type { Sport, MarketType } from '@prisma/client'

// ============================================
// Types
// ============================================

interface OddsResponse {
  success: boolean
  data: any[]
  meta: {
    total: number
  }
}

interface UseOddsParams {
  gameId?: string
  sport?: Sport
  marketType?: MarketType
  sportsbook?: string
  minAge?: number // Max age in minutes
}

// ============================================
// API Fetchers
// ============================================

async function fetchOdds(params: UseOddsParams): Promise<OddsResponse> {
  const searchParams = new URLSearchParams()

  if (params.gameId) searchParams.set('gameId', params.gameId)
  if (params.sport) searchParams.set('sport', params.sport)
  if (params.marketType) searchParams.set('marketType', params.marketType)
  if (params.sportsbook) searchParams.set('sportsbook', params.sportsbook)
  if (params.minAge) searchParams.set('minAge', params.minAge.toString())

  const response = await fetch(`/api/odds?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch odds')
  }

  return response.json()
}

// ============================================
// Hooks
// ============================================

/**
 * Fetch odds with filters
 */
export function useOdds(params: UseOddsParams = {}) {
  return useQuery({
    queryKey: ['odds', params],
    queryFn: () => fetchOdds(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (more aggressive for odds)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch odds on focus
  })
}

/**
 * Fetch odds for a specific game
 */
export function useGameOdds(gameId: string, marketType?: MarketType) {
  return useQuery({
    queryKey: ['odds', { gameId, marketType }],
    queryFn: () => fetchOdds({ gameId, marketType, minAge: 30 }), // Last 30min
    staleTime: 2 * 60 * 1000,
    enabled: !!gameId,
    refetchOnWindowFocus: true,
  })
}

/**
 * Get best odds for a game (highest for favorites, best value)
 */
export function useBestOdds(gameId: string, marketType: MarketType) {
  const { data, ...rest } = useGameOdds(gameId, marketType)

  const bestOdds = data?.data?.reduce((best: any, current: any) => {
    if (!best) return current

    // For spread/total: find best lines
    if (marketType === 'SPREAD') {
      // Best home spread is the smallest (less points to cover)
      return current.homeLine > best.homeLine ? current : best
    }

    if (marketType === 'TOTAL') {
      // For totals, could prioritize by odds value
      return current.overOdds > best.overOdds ? current : best
    }

    if (marketType === 'MONEYLINE') {
      // Best moneyline is highest odds
      return current.homeOdds > best.homeOdds ? current : best
    }

    return best
  }, null)

  return {
    ...rest,
    data: bestOdds,
  }
}

/**
 * Compare odds across sportsbooks for a game
 */
export function useOddsComparison(gameId: string, marketType: MarketType) {
  const { data, ...rest } = useGameOdds(gameId, marketType)

  const comparison = data?.data?.reduce((acc: any, odd: any) => {
    acc[odd.sportsbook] = odd
    return acc
  }, {})

  return {
    ...rest,
    data: comparison || {},
    sportsbooks: data?.data?.map((o: any) => o.sportsbook) || [],
  }
}

/**
 * Track odds movement for a game
 */
export function useOddsMovement(gameId: string, marketType: MarketType) {
  return useQuery({
    queryKey: ['odds-movement', gameId, marketType],
    queryFn: async () => {
      // Fetch all historical odds (not just latest)
      const response = await fetch(
        `/api/odds?gameId=${gameId}&marketType=${marketType}`
      )
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      // Group by sportsbook and track changes over time
      const byBook = data.data.reduce((acc: any, odd: any) => {
        if (!acc[odd.sportsbook]) {
          acc[odd.sportsbook] = []
        }
        acc[odd.sportsbook].push(odd)
        return acc
      }, {})

      // Sort by fetchedAt for each book
      Object.keys(byBook).forEach((book) => {
        byBook[book].sort(
          (a: any, b: any) =>
            new Date(a.fetchedAt).getTime() - new Date(b.fetchedAt).getTime()
        )
      })

      return byBook
    },
  })
}

/**
 * Find arbitrage opportunities (different books, same game)
 */
export function useArbitrageOpportunities(gameId: string) {
  const { data: spreads } = useOddsComparison(gameId, 'SPREAD')
  const { data: moneylines } = useOddsComparison(gameId, 'MONEYLINE')
  const { data: totals } = useOddsComparison(gameId, 'TOTAL')

  // Simplified arbitrage detection
  // In production, this would be more sophisticated
  const opportunities: any[] = []

  // Example: If one book has significantly different odds than others
  // This is a placeholder - real arbitrage calculation is complex

  return {
    opportunities,
    hasArbitrage: opportunities.length > 0,
  }
}
