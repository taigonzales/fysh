/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals'
import { StatsApiClient } from '../client'

describe('StatsApiClient', () => {
  const client = new StatsApiClient()

  test('should fetch player season stats', async () => {
    const stats = await client.getPlayerSeasonStats('LeBron James', 'NBA', '2024-25')

    expect(stats).toBeDefined()
    expect(stats.playerName).toBe('LeBron James')
    expect(stats.sport).toBe('NBA')
    expect(stats.season).toBe('2024-25')
    expect(stats.seasonAvg).toBeDefined()
    expect(stats.seasonAvg.points).toBeGreaterThan(0)
  })

  test('should fetch player last N games', async () => {
    const games = await client.getPlayerRecentGames('LeBron James', 'NBA', 25)

    expect(Array.isArray(games)).toBe(true)
    expect(games.length).toBeLessThanOrEqual(25)
    if (games.length > 0) {
      expect(games[0].points).toBeDefined()
      expect(games[0].date).toBeDefined()
    }
  })

  test('should track rate limit usage', () => {
    const limitInfo = client.getRateLimitInfo()

    expect(limitInfo.dailyLimit).toBe(500)
    expect(limitInfo.requestsToday).toBeGreaterThanOrEqual(0)
  })
})
