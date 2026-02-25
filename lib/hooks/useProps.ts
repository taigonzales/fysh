/**
 * React Query hooks for player props data
 */

import { useQuery } from '@tanstack/react-query'
import type { Sport } from '@prisma/client'

// ============================================
// Types
// ============================================

interface PropsResponse {
  success: boolean
  data: any[]
  meta: {
    total: number
  }
}

interface PropResponse {
  success: boolean
  data: any & {
    historical: any[]
  }
}

interface UsePropsParams {
  playerName?: string
  propType?: string
  gameId?: string
  sport?: Sport
  sportsbook?: string
  minLine?: number
  maxLine?: number
  limit?: number
}

// ============================================
// API Fetchers
// ============================================

async function fetchProps(params: UsePropsParams): Promise<PropsResponse> {
  const searchParams = new URLSearchParams()

  if (params.playerName) searchParams.set('playerName', params.playerName)
  if (params.propType) searchParams.set('propType', params.propType)
  if (params.gameId) searchParams.set('gameId', params.gameId)
  if (params.sport) searchParams.set('sport', params.sport)
  if (params.sportsbook) searchParams.set('sportsbook', params.sportsbook)
  if (params.minLine !== undefined) searchParams.set('minLine', params.minLine.toString())
  if (params.maxLine !== undefined) searchParams.set('maxLine', params.maxLine.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`/api/props?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch props')
  }

  return response.json()
}

async function fetchProp(id: string): Promise<PropResponse> {
  const response = await fetch(`/api/props/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch prop')
  }

  return response.json()
}

// ============================================
// Hooks
// ============================================

/**
 * Search player props
 */
export function usePlayerProps(params: UsePropsParams = {}) {
  return useQuery({
    queryKey: ['props', params],
    queryFn: () => fetchProps(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Get single prop with historical data
 */
export function usePlayerProp(id: string) {
  return useQuery({
    queryKey: ['prop', id],
    queryFn: () => fetchProp(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

/**
 * Get props for a specific game
 */
export function useGameProps(gameId: string, propType?: string) {
  return useQuery({
    queryKey: ['props', { gameId, propType }],
    queryFn: () => fetchProps({ gameId, propType }),
    staleTime: 5 * 60 * 1000,
    enabled: !!gameId,
  })
}

/**
 * Search props by player name
 */
export function usePlayerPropsByName(
  playerName: string,
  sport?: Sport,
  propType?: string
) {
  return useQuery({
    queryKey: ['props', { playerName, sport, propType }],
    queryFn: () => fetchProps({ playerName, sport, propType }),
    staleTime: 5 * 60 * 1000,
    enabled: !!playerName && playerName.length >= 2,
  })
}

/**
 * Get popular prop types for a sport
 */
export function usePopularProps(sport: Sport, limit: number = 20) {
  return useQuery({
    queryKey: ['props', 'popular', sport],
    queryFn: () => fetchProps({ sport, limit }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Find props with high hit rates
 */
export function useHighHitRateProps(sport: Sport, minHitRate: number = 0.7) {
  return useQuery({
    queryKey: ['props', 'high-hit-rate', sport, minHitRate],
    queryFn: async () => {
      const response = await fetchProps({ sport, limit: 100 })

      // Filter props with high hit rates
      // Note: This assumes hit rate data is populated (from Part 3: AI Layer)
      const highHitProps = response.data.filter((prop: any) => {
        return (
          prop.hitRateLast5 >= minHitRate ||
          prop.hitRateLast10 >= minHitRate ||
          prop.hitRateSeason >= minHitRate
        )
      })

      return {
        ...response,
        data: highHitProps,
        meta: { total: highHitProps.length },
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Compare prop lines across sportsbooks
 */
export function usePropComparison(
  playerName: string,
  propType: string,
  gameId: string
) {
  const { data, ...rest } = usePlayerProps({ playerName, propType, gameId })

  const comparison = data?.data?.reduce((acc: any, prop: any) => {
    acc[prop.sportsbook] = prop
    return acc
  }, {})

  // Find best lines
  const bestOver = data?.data?.reduce((best: any, current: any) => {
    if (!best || current.overOdds > best.overOdds) return current
    return best
  }, null)

  const bestUnder = data?.data?.reduce((best: any, current: any) => {
    if (!best || current.underOdds > best.underOdds) return current
    return best
  }, null)

  return {
    ...rest,
    data: comparison || {},
    sportsbooks: data?.data?.map((p: any) => p.sportsbook) || [],
    bestOver,
    bestUnder,
  }
}

/**
 * Get trending props (most viewed/picked)
 */
export function useTrendingProps(sport?: Sport, limit: number = 10) {
  return useQuery({
    queryKey: ['props', 'trending', sport],
    queryFn: async () => {
      // In production, this would track view counts or pick counts
      // For now, just return recent props
      return fetchProps({ sport, limit })
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Search props within a line range
 */
export function usePropsByLineRange(
  sport: Sport,
  propType: string,
  minLine: number,
  maxLine: number
) {
  return useQuery({
    queryKey: ['props', 'range', { sport, propType, minLine, maxLine }],
    queryFn: () => fetchProps({ sport, propType, minLine, maxLine }),
    staleTime: 5 * 60 * 1000,
    enabled: minLine !== undefined && maxLine !== undefined && minLine <= maxLine,
  })
}
