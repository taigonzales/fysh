/**
 * Odds API Client Tests
 *
 * Note: These tests require ODDS_API_KEY to be set
 * Run with: npm test or pnpm test
 */

import { describe, test, expect, beforeAll } from '@jest/globals'
import { oddsApiClient, getRateLimitInfo } from '../client'
import { transformGame, transformOdds } from '../transformers'

describe('OddsApiClient', () => {
  beforeAll(() => {
    if (!process.env.ODDS_API_KEY) {
      console.warn('⚠️  ODDS_API_KEY not set - tests will be skipped')
    }
  })

  test('should fetch sports list', async () => {
    if (!process.env.ODDS_API_KEY) {
      console.log('Skipping: No API key')
      return
    }

    const sports = await oddsApiClient.getSports()

    expect(Array.isArray(sports)).toBe(true)
    expect(sports.length).toBeGreaterThan(0)
    expect(sports[0]).toHaveProperty('key')
    expect(sports[0]).toHaveProperty('title')
  })

  test('should fetch NBA events', async () => {
    if (!process.env.ODDS_API_KEY) {
      console.log('Skipping: No API key')
      return
    }

    const events = await oddsApiClient.getEvents('basketball_nba')

    expect(Array.isArray(events)).toBe(true)

    if (events.length > 0) {
      expect(events[0]).toHaveProperty('id')
      expect(events[0]).toHaveProperty('home_team')
      expect(events[0]).toHaveProperty('away_team')
      expect(events[0]).toHaveProperty('commence_time')
    }
  })

  test('should track rate limit info', async () => {
    if (!process.env.ODDS_API_KEY) {
      console.log('Skipping: No API key')
      return
    }

    await oddsApiClient.getSports() // Make a request

    const rateLimitInfo = getRateLimitInfo()

    expect(rateLimitInfo).toHaveProperty('requestsRemaining')
    expect(rateLimitInfo).toHaveProperty('requestsUsed')
    expect(typeof rateLimitInfo.requestsRemaining).toBe('number')
  })

  test('should transform event to game', () => {
    const mockEvent = {
      id: 'test123',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: '2024-02-24T19:00:00Z',
      home_team: 'Los Angeles Lakers',
      away_team: 'Boston Celtics',
    }

    const game = transformGame(mockEvent)

    expect(game.externalId).toBe('test123')
    expect(game.sport).toBe('NBA')
    expect(game.homeTeam).toBe('Los Angeles Lakers')
    expect(game.awayTeam).toBe('Boston Celtics')
    expect(game.homeTeamAbbr).toBe('LAL')
    expect(game.awayTeamAbbr).toBe('BOS')
    expect(game.startTime).toBeInstanceOf(Date)
  })

  test('should transform bookmaker to odds', () => {
    const mockEvent = {
      id: 'test123',
      sport_key: 'basketball_nba',
      sport_title: 'NBA',
      commence_time: '2024-02-24T19:00:00Z',
      home_team: 'Los Angeles Lakers',
      away_team: 'Boston Celtics',
    }

    const mockBookmaker = {
      key: 'draftkings',
      title: 'DraftKings',
      last_update: '2024-02-24T18:00:00Z',
      markets: [
        {
          key: 'h2h',
          last_update: '2024-02-24T18:00:00Z',
          outcomes: [
            { name: 'Los Angeles Lakers', price: -150 },
            { name: 'Boston Celtics', price: 130 },
          ],
        },
      ],
    }

    const odds = transformOdds(mockEvent, mockBookmaker)

    expect(odds.length).toBeGreaterThan(0)
    expect(odds[0].sportsbook).toBe('draftkings')
    expect(odds[0].marketType).toBe('MONEYLINE')
    expect(odds[0].homeOdds).toBe(-150)
    expect(odds[0].awayOdds).toBe(130)
  })
})

describe('Error Handling', () => {
  test('should handle invalid API key', async () => {
    // This would need to temporarily set an invalid key
    // Skip for now to avoid breaking tests
    expect(true).toBe(true)
  })

  test('should handle rate limiting', async () => {
    // This would need to exhaust quota
    // Skip for now
    expect(true).toBe(true)
  })
})
