/**
 * React Query hooks for game data
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { Game, Sport, GameStatus } from '@prisma/client'

// ============================================
// Types
// ============================================

interface GameWithCounts extends Game {
  _count: {
    odds: number
    props: number
  }
}

interface GamesResponse {
  success: boolean
  data: GameWithCounts[]
  meta: {
    total: number
    hasMore: boolean
    nextCursor: string | null
  }
}

interface GameResponse {
  success: boolean
  data: Game & {
    odds: any[]
    props: any[]
  }
}

interface UseGamesParams {
  sport?: Sport
  status?: GameStatus
  date?: string
  startDate?: string
  endDate?: string
  limit?: number
}

// ============================================
// API Fetchers
// ============================================

async function fetchGames(params: UseGamesParams): Promise<GamesResponse> {
  const searchParams = new URLSearchParams()

  if (params.sport) searchParams.set('sport', params.sport)
  if (params.status) searchParams.set('status', params.status)
  if (params.date) searchParams.set('date', params.date)
  if (params.startDate) searchParams.set('startDate', params.startDate)
  if (params.endDate) searchParams.set('endDate', params.endDate)
  if (params.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`/api/games?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch games')
  }

  return response.json()
}

async function fetchGame(id: string): Promise<GameResponse> {
  const response = await fetch(`/api/games/${id}`)

  if (!response.ok) {
    throw new Error('Failed to fetch game')
  }

  return response.json()
}

// ============================================
// Hooks
// ============================================

/**
 * Fetch games with filters
 */
export function useGames(params: UseGamesParams = {}) {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => fetchGames(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Fetch single game with odds and props
 */
export function useGame(id: string) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => fetchGame(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  })
}

/**
 * Fetch games for today
 */
export function useTodayGames(sport?: Sport) {
  const today = new Date().toISOString().split('T')[0]

  return useGames({
    date: today,
    sport,
    status: 'SCHEDULED',
  })
}

/**
 * Fetch upcoming games (next 7 days)
 */
export function useUpcomingGames(sport?: Sport, limit: number = 50) {
  const startDate = new Date().toISOString()
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  return useGames({
    startDate,
    endDate,
    sport,
    status: 'SCHEDULED',
    limit,
  })
}

/**
 * Fetch live games
 */
export function useLiveGames(sport?: Sport) {
  return useQuery({
    queryKey: ['games', { status: 'LIVE', sport }],
    queryFn: () => fetchGames({ status: 'LIVE', sport }),
    staleTime: 30 * 1000, // 30 seconds for live games
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

/**
 * Infinite scroll games
 */
export function useInfiniteGames(params: UseGamesParams = {}) {
  return useInfiniteQuery({
    queryKey: ['games-infinite', params],
    queryFn: async ({ pageParam }) => {
      return fetchGames({
        ...params,
        // Add cursor to params if provided
      })
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  })
}
