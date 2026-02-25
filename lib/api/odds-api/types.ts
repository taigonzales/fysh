/**
 * TypeScript interfaces for The Odds API v4 responses
 * Documentation: https://the-odds-api.com/liveapi/guides/v4/
 */

// ============================================
// API Response Types
// ============================================

export interface OddsApiSport {
  key: string
  group: string
  title: string
  description: string
  active: boolean
  has_outrights: boolean
}

export interface OddsApiEvent {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string // ISO 8601 timestamp
  home_team: string
  away_team: string
  bookmakers?: OddsApiBookmaker[]
}

export interface OddsApiBookmaker {
  key: string
  title: string
  last_update: string // ISO 8601 timestamp
  markets: OddsApiMarket[]
}

export interface OddsApiMarket {
  key: string // 'h2h' | 'spreads' | 'totals' | 'player_points' etc
  last_update: string
  outcomes: OddsApiOutcome[]
}

export interface OddsApiOutcome {
  name: string // Team name or player name or 'Over'/'Under'
  price: number // American odds (e.g., -110, +150)
  point?: number // Spread or total value
  description?: string // For player props (e.g., 'Points', 'Assists')

  // QuickSlip deep-link fields (when includeLinks=true)
  bookmaker_event_id?: string
  bookmaker_market_id?: string
  bookmaker_selection_id?: string
  deeplink_url?: string
}

// ============================================
// Internal Transform Types
// ============================================

export interface TransformedGame {
  externalId: string
  sport: string
  homeTeam: string
  awayTeam: string
  homeTeamAbbr: string
  awayTeamAbbr: string
  startTime: Date
  status: 'SCHEDULED' | 'LIVE' | 'FINAL'
  season: string
  week?: string
}

export interface TransformedOdds {
  gameExternalId: string
  sportsbook: string
  marketType: 'SPREAD' | 'MONEYLINE' | 'TOTAL'
  homeLine?: number
  awayLine?: number
  homeOdds: number
  awayOdds: number
  overUnder?: number
  overOdds?: number
  underOdds?: number
  fetchedAt: Date

  // QuickSlip fields
  bookmakerEventId?: string
  bookmakerMarketId?: string
  bookmakerSelectionId?: string
  deeplinkUrl?: string
}

export interface TransformedPlayerProp {
  gameExternalId: string
  playerName: string
  playerTeam: string
  propType: string // 'points', 'assists', 'rebounds', etc
  line: number
  overOdds: number
  underOdds: number
  sportsbook: string
  fetchedAt: Date

  // QuickSlip fields
  bookmakerEventId?: string
  bookmakerMarketId?: string
  bookmakerSelectionId?: string
  deeplinkUrl?: string
}

// ============================================
// API Client Types
// ============================================

export interface OddsApiConfig {
  apiKey: string
  baseUrl: string
  timeout: number
  maxRetries: number
}

export interface FetchOddsParams {
  sport: string
  regions?: string[] // e.g., ['us', 'uk']
  markets?: string[] // e.g., ['h2h', 'spreads', 'totals']
  oddsFormat?: 'american' | 'decimal'
  dateFormat?: 'iso' | 'unix'
  includeLinks?: boolean // Enable QuickSlip deep links
  bookmakers?: string[]
}

export interface FetchPlayerPropsParams {
  sport: string
  eventId: string
  markets?: string[] // e.g., ['player_points', 'player_assists']
  regions?: string[]
  oddsFormat?: 'american' | 'decimal'
  includeLinks?: boolean
  bookmakers?: string[]
}

export interface ApiRateLimitInfo {
  requestsRemaining: number
  requestsUsed: number
  resetAt?: Date
}

export interface OddsApiError {
  message: string
  statusCode?: number
  endpoint?: string
  timestamp: Date
}

// ============================================
// Sport Keys (from The Odds API)
// ============================================

export type SupportedSport =
  | 'basketball_nba'
  | 'americanfootball_nfl'
  | 'baseball_mlb'
  | 'icehockey_nhl'
  | 'basketball_ncaab'
  | 'americanfootball_ncaaf'

// ============================================
// Market Keys (from The Odds API)
// ============================================

export type MarketKey =
  | 'h2h' // Moneyline
  | 'spreads' // Point spreads
  | 'totals' // Over/under
  | 'player_points'
  | 'player_rebounds'
  | 'player_assists'
  | 'player_threes'
  | 'player_blocks'
  | 'player_steals'
  | 'player_turnovers'
  | 'player_pass_tds'
  | 'player_pass_yds'
  | 'player_rush_yds'
  | 'player_receptions'
  | 'player_reception_yds'
  | 'pitcher_strikeouts'
  | 'batter_total_bases'
  | 'batter_hits'
  | 'batter_home_runs'

// ============================================
// Bookmaker Keys (supported by QuickSlip)
// ============================================

export type BookmakerKey =
  | 'draftkings'
  | 'fanduel'
  | 'betmgm'
  | 'caesars'
  | 'pointsbetus'
  | 'wynnbet'
  | 'betrivers'
  | 'unibet_us'
  | 'espnbet'
