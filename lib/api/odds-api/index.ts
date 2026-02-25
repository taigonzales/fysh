/**
 * The Odds API Client - Public API
 *
 * Usage:
 * ```typescript
 * import { oddsApiClient, transformGames, transformAllOdds } from '@/lib/api/odds-api'
 *
 * const events = await oddsApiClient.getOdds({ sport: 'basketball_nba', includeLinks: true })
 * const games = transformGames(events)
 * const odds = transformAllOdds(events)
 * ```
 */

export { oddsApiClient, getRateLimitInfo, hasRateLimitQuota, shouldBlockRequest } from './client'

export {
  transformGame,
  transformGames,
  transformOdds,
  transformAllOdds,
  transformPlayerProps,
  transformAllPlayerProps,
} from './transformers'

export {
  SPORT_KEYS,
  API_SPORT_TO_DB_SPORT,
  MARKET_TYPE_MAP,
  DEFAULT_MARKETS,
  PLAYER_PROP_MARKETS,
  PRIORITY_BOOKMAKERS,
  BOOKMAKER_DISPLAY_NAMES,
  QUICKSLIP_ENABLED_BOOKMAKERS,
  API_CONFIG,
  RATE_LIMIT_CONFIG,
  SYNC_CONFIG,
  getCurrentSeason,
  getTeamAbbreviation,
} from './constants'

export type {
  OddsApiSport,
  OddsApiEvent,
  OddsApiBookmaker,
  OddsApiMarket,
  OddsApiOutcome,
  TransformedGame,
  TransformedOdds,
  TransformedPlayerProp,
  FetchOddsParams,
  FetchPlayerPropsParams,
  ApiRateLimitInfo,
  OddsApiError,
  SupportedSport,
  MarketKey,
  BookmakerKey,
} from './types'
