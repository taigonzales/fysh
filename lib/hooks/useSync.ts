/**
 * React Query hooks for sync operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// ============================================
// Types
// ============================================

interface SyncResult {
  success: boolean
  data?: {
    timestamp: Date
    games?: any
    odds?: any
    props?: any
    rateLimitInfo: {
      requestsRemaining: number
      requestsUsed: number
    }
    totalDuration: number
  }
  error?: string
  message?: string
}

interface TriggerSyncParams {
  type: 'games' | 'odds' | 'props' | 'full'
  adminKey: string
}

// ============================================
// API Fetchers
// ============================================

async function triggerSync(params: TriggerSyncParams): Promise<SyncResult> {
  const response = await fetch('/api/sync/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Sync failed')
  }

  return response.json()
}

// ============================================
// Hooks
// ============================================

/**
 * Trigger manual sync
 */
export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: triggerSync,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries based on sync type
      if (variables.type === 'games' || variables.type === 'full') {
        queryClient.invalidateQueries({ queryKey: ['games'] })
      }

      if (variables.type === 'odds' || variables.type === 'full') {
        queryClient.invalidateQueries({ queryKey: ['odds'] })
      }

      if (variables.type === 'props' || variables.type === 'full') {
        queryClient.invalidateQueries({ queryKey: ['props'] })
      }
    },
  })
}

/**
 * Get sync status (if you add a status endpoint later)
 */
export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: async () => {
      // Placeholder - implement status endpoint if needed
      return {
        lastSync: null,
        inProgress: false,
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    enabled: false, // Disabled until status endpoint exists
  })
}

/**
 * Check API quota
 */
export function useApiQuota() {
  return useQuery({
    queryKey: ['api-quota'],
    queryFn: async () => {
      // This would need a dedicated endpoint
      // For now, return placeholder
      return {
        remaining: 500,
        used: 0,
        limit: 500,
      }
    },
    staleTime: 60 * 1000,
    enabled: false, // Disabled until quota endpoint exists
  })
}

/**
 * Prefetch upcoming games (for better UX)
 */
export function usePrefetchUpcoming() {
  const queryClient = useQueryClient()

  return () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    queryClient.prefetchQuery({
      queryKey: ['games', { date: tomorrow.toISOString().split('T')[0] }],
      queryFn: async () => {
        const response = await fetch(
          `/api/games?date=${tomorrow.toISOString().split('T')[0]}`
        )
        return response.json()
      },
    })
  }
}

/**
 * Invalidate all game-related queries
 */
export function useInvalidateGames() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['games'] })
    queryClient.invalidateQueries({ queryKey: ['game'] })
  }
}

/**
 * Invalidate all odds-related queries
 */
export function useInvalidateOdds() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['odds'] })
  }
}

/**
 * Invalidate all props-related queries
 */
export function useInvalidateProps() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['props'] })
    queryClient.invalidateQueries({ queryKey: ['prop'] })
  }
}

/**
 * Refresh all data
 */
export function useRefreshAll() {
  const invalidateGames = useInvalidateGames()
  const invalidateOdds = useInvalidateOdds()
  const invalidateProps = useInvalidateProps()

  return () => {
    invalidateGames()
    invalidateOdds()
    invalidateProps()
  }
}
