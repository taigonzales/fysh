/**
 * Transform The Odds API responses into Prisma-compatible formats
 */

import type {
  OddsApiEvent,
  OddsApiBookmaker,
  OddsApiMarket,
  OddsApiOutcome,
  TransformedGame,
  TransformedOdds,
  TransformedPlayerProp,
} from './types'
import {
  API_SPORT_TO_DB_SPORT,
  MARKET_TYPE_MAP,
  getCurrentSeason,
  getTeamAbbreviation,
} from './constants'

// ============================================
// Game Transformers
// ============================================

/**
 * Transform OddsApiEvent to TransformedGame
 */
export function transformGame(event: OddsApiEvent): TransformedGame {
  const dbSport = API_SPORT_TO_DB_SPORT[event.sport_key as keyof typeof API_SPORT_TO_DB_SPORT]

  if (!dbSport) {
    throw new Error(`Unsupported sport: ${event.sport_key}`)
  }

  return {
    externalId: event.id,
    sport: dbSport,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    homeTeamAbbr: getTeamAbbreviation(event.home_team, dbSport),
    awayTeamAbbr: getTeamAbbreviation(event.away_team, dbSport),
    startTime: new Date(event.commence_time),
    status: determineGameStatus(new Date(event.commence_time)),
    season: getCurrentSeason(dbSport),
    week: extractWeek(event, dbSport),
  }
}

/**
 * Determine game status based on start time
 * Note: This is a simplified version. Real implementation would check live scores.
 */
function determineGameStatus(
  startTime: Date
): 'SCHEDULED' | 'LIVE' | 'FINAL' {
  const now = new Date()
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilStart > 0) {
    return 'SCHEDULED'
  }

  // Rough estimate: game likely finished after 4 hours
  if (hoursUntilStart < -4) {
    return 'FINAL'
  }

  return 'LIVE'
}

/**
 * Extract week number for NFL/NCAAF
 */
function extractWeek(event: OddsApiEvent, sport: string): string | undefined {
  if (sport !== 'NFL' && sport !== 'NCAAF') {
    return undefined
  }

  // Calculate week based on season start (NFL starts first Thursday of September)
  const startTime = new Date(event.commence_time)
  const season = parseInt(getCurrentSeason(sport), 10)
  const seasonStart = getSeasonStart(sport, season)

  const daysSinceStart =
    (startTime.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24)
  const week = Math.floor(daysSinceStart / 7) + 1

  return week > 0 && week <= 18 ? week.toString() : '1'
}

function getSeasonStart(sport: string, year: number): Date {
  if (sport === 'NFL') {
    // NFL starts first Thursday of September
    const sept1 = new Date(year, 8, 1) // September 1
    const firstThursday = sept1.getDay() <= 4 ? 4 - sept1.getDay() : 11 - sept1.getDay()
    return new Date(year, 8, 1 + firstThursday)
  }

  if (sport === 'NCAAF') {
    // College football starts late August
    return new Date(year, 7, 25) // August 25
  }

  return new Date(year, 0, 1)
}

// ============================================
// Odds Transformers
// ============================================

/**
 * Transform bookmaker markets into TransformedOdds array
 */
export function transformOdds(
  event: OddsApiEvent,
  bookmaker: OddsApiBookmaker
): TransformedOdds[] {
  const odds: TransformedOdds[] = []
  const fetchedAt = bookmaker.last_update ? new Date(bookmaker.last_update) : new Date()

  for (const market of bookmaker.markets) {
    const marketType = MARKET_TYPE_MAP[market.key as keyof typeof MARKET_TYPE_MAP]

    if (!marketType) {
      // Skip unsupported market types (player props handled separately)
      continue
    }

    if (marketType === 'MONEYLINE') {
      const moneyline = transformMoneylineMarket(
        event,
        bookmaker.key,
        market,
        fetchedAt
      )
      if (moneyline) odds.push(moneyline)
    } else if (marketType === 'SPREAD') {
      const spread = transformSpreadMarket(event, bookmaker.key, market, fetchedAt)
      if (spread) odds.push(spread)
    } else if (marketType === 'TOTAL') {
      const total = transformTotalMarket(event, bookmaker.key, market, fetchedAt)
      if (total) odds.push(total)
    }
  }

  return odds
}

function transformMoneylineMarket(
  event: OddsApiEvent,
  sportsbook: string,
  market: OddsApiMarket,
  fetchedAt: Date
): TransformedOdds | null {
  const homeOutcome = market.outcomes.find((o) => o.name === event.home_team)
  const awayOutcome = market.outcomes.find((o) => o.name === event.away_team)

  if (!homeOutcome || !awayOutcome) {
    return null
  }

  return {
    gameExternalId: event.id,
    sportsbook,
    marketType: 'MONEYLINE',
    homeOdds: homeOutcome.price,
    awayOdds: awayOutcome.price,
    fetchedAt,
    bookmakerEventId: homeOutcome.bookmaker_event_id,
    bookmakerMarketId: homeOutcome.bookmaker_market_id,
    bookmakerSelectionId: homeOutcome.bookmaker_selection_id,
    deeplinkUrl: homeOutcome.deeplink_url,
  }
}

function transformSpreadMarket(
  event: OddsApiEvent,
  sportsbook: string,
  market: OddsApiMarket,
  fetchedAt: Date
): TransformedOdds | null {
  const homeOutcome = market.outcomes.find((o) => o.name === event.home_team)
  const awayOutcome = market.outcomes.find((o) => o.name === event.away_team)

  if (!homeOutcome || !awayOutcome || homeOutcome.point === undefined) {
    return null
  }

  return {
    gameExternalId: event.id,
    sportsbook,
    marketType: 'SPREAD',
    homeLine: homeOutcome.point,
    awayLine: awayOutcome.point,
    homeOdds: homeOutcome.price,
    awayOdds: awayOutcome.price,
    fetchedAt,
    bookmakerEventId: homeOutcome.bookmaker_event_id,
    bookmakerMarketId: homeOutcome.bookmaker_market_id,
    bookmakerSelectionId: homeOutcome.bookmaker_selection_id,
    deeplinkUrl: homeOutcome.deeplink_url,
  }
}

function transformTotalMarket(
  event: OddsApiEvent,
  sportsbook: string,
  market: OddsApiMarket,
  fetchedAt: Date
): TransformedOdds | null {
  const overOutcome = market.outcomes.find((o) => o.name === 'Over')
  const underOutcome = market.outcomes.find((o) => o.name === 'Under')

  if (!overOutcome || !underOutcome || overOutcome.point === undefined) {
    return null
  }

  return {
    gameExternalId: event.id,
    sportsbook,
    marketType: 'TOTAL',
    overUnder: overOutcome.point,
    overOdds: overOutcome.price,
    underOdds: underOutcome.price,
    homeOdds: 0, // Required by schema but not applicable
    awayOdds: 0,
    fetchedAt,
    bookmakerEventId: overOutcome.bookmaker_event_id,
    bookmakerMarketId: overOutcome.bookmaker_market_id,
    bookmakerSelectionId: overOutcome.bookmaker_selection_id,
    deeplinkUrl: overOutcome.deeplink_url,
  }
}

// ============================================
// Player Prop Transformers
// ============================================

/**
 * Transform player prop markets into TransformedPlayerProp array
 */
export function transformPlayerProps(
  event: OddsApiEvent,
  bookmaker: OddsApiBookmaker
): TransformedPlayerProp[] {
  const props: TransformedPlayerProp[] = []
  const fetchedAt = bookmaker.last_update ? new Date(bookmaker.last_update) : new Date()

  for (const market of bookmaker.markets) {
    // Only process player prop markets
    if (!market.key.startsWith('player_')) {
      continue
    }

    const propType = market.key.replace('player_', '')

    // Player props have pairs of Over/Under outcomes for each player
    const playerMap = new Map<string, { over?: OddsApiOutcome; under?: OddsApiOutcome }>()

    for (const outcome of market.outcomes) {
      if (outcome.name === 'Over' || outcome.name === 'Under') {
        continue // Skip generic Over/Under
      }

      // Player name is in the outcome.name, description has the prop type
      const playerName = outcome.name
      const entry = playerMap.get(playerName) || {}

      // Over outcome has the line value
      if (outcome.point !== undefined) {
        entry.over = outcome
      } else {
        entry.under = outcome
      }

      playerMap.set(playerName, entry)
    }

    // Create props from pairs
    for (const [playerName, { over, under }] of playerMap.entries()) {
      if (!over || !under || over.point === undefined) {
        continue
      }

      // Determine player team (rough heuristic - could be improved)
      const playerTeam = determinePlayerTeam(playerName, event)

      props.push({
        gameExternalId: event.id,
        playerName,
        playerTeam,
        propType,
        line: over.point,
        overOdds: over.price,
        underOdds: under.price,
        sportsbook: bookmaker.key,
        fetchedAt,
        bookmakerEventId: over.bookmaker_event_id,
        bookmakerMarketId: over.bookmaker_market_id,
        bookmakerSelectionId: over.bookmaker_selection_id,
        deeplinkUrl: over.deeplink_url,
      })
    }
  }

  return props
}

/**
 * Determine which team a player belongs to
 * This is a heuristic - in production you'd want a player roster database
 */
function determinePlayerTeam(playerName: string, event: OddsApiEvent): string {
  // For now, just return home team as placeholder
  // TODO: Implement player roster lookup
  return event.home_team
}

// ============================================
// Batch Transform Helpers
// ============================================

/**
 * Transform all events into games
 */
export function transformGames(events: OddsApiEvent[]): TransformedGame[] {
  return events.map(transformGame)
}

/**
 * Transform all odds from events with bookmakers
 */
export function transformAllOdds(events: OddsApiEvent[]): TransformedOdds[] {
  const allOdds: TransformedOdds[] = []

  for (const event of events) {
    if (!event.bookmakers) continue

    for (const bookmaker of event.bookmakers) {
      const odds = transformOdds(event, bookmaker)
      allOdds.push(...odds)
    }
  }

  return allOdds
}

/**
 * Transform all player props from events
 */
export function transformAllPlayerProps(events: OddsApiEvent[]): TransformedPlayerProp[] {
  const allProps: TransformedPlayerProp[] = []

  for (const event of events) {
    if (!event.bookmakers) continue

    for (const bookmaker of event.bookmakers) {
      const props = transformPlayerProps(event, bookmaker)
      allProps.push(...props)
    }
  }

  return allProps
}
