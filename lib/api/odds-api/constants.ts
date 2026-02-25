/**
 * Constants and configuration for The Odds API integration
 */

import type { SupportedSport, MarketKey, BookmakerKey } from './types'

// ============================================
// Sport Mappings
// ============================================

export const SPORT_KEYS: Record<string, SupportedSport> = {
  NBA: 'basketball_nba',
  NFL: 'americanfootball_nfl',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
  NCAAB: 'basketball_ncaab',
  NCAAF: 'americanfootball_ncaaf',
} as const

export const API_SPORT_TO_DB_SPORT: Record<SupportedSport, string> = {
  basketball_nba: 'NBA',
  americanfootball_nfl: 'NFL',
  baseball_mlb: 'MLB',
  icehockey_nhl: 'NHL',
  basketball_ncaab: 'NCAAB',
  americanfootball_ncaaf: 'NCAAF',
} as const

// ============================================
// Team Abbreviations
// ============================================

export const NBA_TEAM_ABBR: Record<string, string> = {
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS',
} as const

export const NFL_TEAM_ABBR: Record<string, string> = {
  'Arizona Cardinals': 'ARI',
  'Atlanta Falcons': 'ATL',
  'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF',
  'Carolina Panthers': 'CAR',
  'Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN',
  'Cleveland Browns': 'CLE',
  'Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN',
  'Detroit Lions': 'DET',
  'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU',
  'Indianapolis Colts': 'IND',
  'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC',
  'Las Vegas Raiders': 'LV',
  'Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LAR',
  'Miami Dolphins': 'MIA',
  'Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE',
  'New Orleans Saints': 'NO',
  'New York Giants': 'NYG',
  'New York Jets': 'NYJ',
  'Philadelphia Eagles': 'PHI',
  'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF',
  'Seattle Seahawks': 'SEA',
  'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN',
  'Washington Commanders': 'WAS',
} as const

export const MLB_TEAM_ABBR: Record<string, string> = {
  'Arizona Diamondbacks': 'ARI',
  'Atlanta Braves': 'ATL',
  'Baltimore Orioles': 'BAL',
  'Boston Red Sox': 'BOS',
  'Chicago Cubs': 'CHC',
  'Chicago White Sox': 'CWS',
  'Cincinnati Reds': 'CIN',
  'Cleveland Guardians': 'CLE',
  'Colorado Rockies': 'COL',
  'Detroit Tigers': 'DET',
  'Houston Astros': 'HOU',
  'Kansas City Royals': 'KC',
  'Los Angeles Angels': 'LAA',
  'Los Angeles Dodgers': 'LAD',
  'Miami Marlins': 'MIA',
  'Milwaukee Brewers': 'MIL',
  'Minnesota Twins': 'MIN',
  'New York Mets': 'NYM',
  'New York Yankees': 'NYY',
  'Oakland Athletics': 'OAK',
  'Philadelphia Phillies': 'PHI',
  'Pittsburgh Pirates': 'PIT',
  'San Diego Padres': 'SD',
  'San Francisco Giants': 'SF',
  'Seattle Mariners': 'SEA',
  'St. Louis Cardinals': 'STL',
  'Tampa Bay Rays': 'TB',
  'Texas Rangers': 'TEX',
  'Toronto Blue Jays': 'TOR',
  'Washington Nationals': 'WAS',
} as const

export const NHL_TEAM_ABBR: Record<string, string> = {
  'Anaheim Ducks': 'ANA',
  'Arizona Coyotes': 'ARI',
  'Boston Bruins': 'BOS',
  'Buffalo Sabres': 'BUF',
  'Calgary Flames': 'CGY',
  'Carolina Hurricanes': 'CAR',
  'Chicago Blackhawks': 'CHI',
  'Colorado Avalanche': 'COL',
  'Columbus Blue Jackets': 'CBJ',
  'Dallas Stars': 'DAL',
  'Detroit Red Wings': 'DET',
  'Edmonton Oilers': 'EDM',
  'Florida Panthers': 'FLA',
  'Los Angeles Kings': 'LAK',
  'Minnesota Wild': 'MIN',
  'Montreal Canadiens': 'MTL',
  'Nashville Predators': 'NSH',
  'New Jersey Devils': 'NJD',
  'New York Islanders': 'NYI',
  'New York Rangers': 'NYR',
  'Ottawa Senators': 'OTT',
  'Philadelphia Flyers': 'PHI',
  'Pittsburgh Penguins': 'PIT',
  'San Jose Sharks': 'SJS',
  'Seattle Kraken': 'SEA',
  'St. Louis Blues': 'STL',
  'Tampa Bay Lightning': 'TBL',
  'Toronto Maple Leafs': 'TOR',
  'Utah Hockey Club': 'UTA',
  'Vancouver Canucks': 'VAN',
  'Vegas Golden Knights': 'VGK',
  'Washington Capitals': 'WSH',
  'Winnipeg Jets': 'WPG',
} as const

// ============================================
// Market Mappings
// ============================================

export const MARKET_TYPE_MAP: Record<string, 'SPREAD' | 'MONEYLINE' | 'TOTAL'> = {
  h2h: 'MONEYLINE',
  spreads: 'SPREAD',
  totals: 'TOTAL',
} as const

export const DEFAULT_MARKETS: MarketKey[] = ['h2h', 'spreads', 'totals']

export const PLAYER_PROP_MARKETS: Record<string, MarketKey[]> = {
  NBA: [
    'player_points',
    'player_rebounds',
    'player_assists',
    'player_threes',
    'player_blocks',
    'player_steals',
  ],
  NFL: [
    'player_pass_tds',
    'player_pass_yds',
    'player_rush_yds',
    'player_receptions',
    'player_reception_yds',
  ],
  MLB: ['pitcher_strikeouts', 'batter_total_bases', 'batter_hits', 'batter_home_runs'],
  NHL: ['player_points', 'player_assists'], // Limited NHL props
  NCAAB: ['player_points', 'player_rebounds', 'player_assists'],
  NCAAF: ['player_pass_tds', 'player_pass_yds', 'player_rush_yds'],
} as const

// ============================================
// Bookmaker Configuration
// ============================================

export const PRIORITY_BOOKMAKERS: BookmakerKey[] = [
  'draftkings',
  'fanduel',
  'betmgm',
  'caesars',
  'pointsbetus',
]

export const BOOKMAKER_DISPLAY_NAMES: Record<BookmakerKey, string> = {
  draftkings: 'DraftKings',
  fanduel: 'FanDuel',
  betmgm: 'BetMGM',
  caesars: 'Caesars',
  pointsbetus: 'PointsBet',
  wynnbet: 'WynnBET',
  betrivers: 'BetRivers',
  unibet_us: 'Unibet',
  espnbet: 'ESPN BET',
}

// Bookmakers that support QuickSlip deep linking
export const QUICKSLIP_ENABLED_BOOKMAKERS: BookmakerKey[] = [
  'draftkings',
  'fanduel',
  'betmgm',
  'caesars',
  'pointsbetus',
]

// ============================================
// API Configuration
// ============================================

export const API_CONFIG = {
  BASE_URL: process.env.ODDS_API_BASE_URL || 'https://api.the-odds-api.com/v4',
  TIMEOUT: 15000, // 15 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  REGIONS: ['us'], // Focus on US markets
  ODDS_FORMAT: 'american' as const,
  DATE_FORMAT: 'iso' as const,
} as const

export const RATE_LIMIT_CONFIG = {
  // Free tier: 500 requests/month
  MONTHLY_QUOTA: 500,
  WARNING_THRESHOLD: 50, // Alert when < 50 requests remaining
  CRITICAL_THRESHOLD: 10, // Block non-essential requests
  TRACK_HEADER: 'x-requests-remaining',
} as const

// ============================================
// Sync Configuration
// ============================================

export const SYNC_CONFIG = {
  // Time windows for fetching odds
  UPCOMING_WINDOW_HOURS: 48, // Fetch odds for games in next 48h
  RECENT_WINDOW_HOURS: 24, // Keep data for games from last 24h
  GAME_HISTORY_DAYS: 7, // Fetch games from last 7 days

  // Priority thresholds (hours until game start)
  HIGH_PRIORITY_THRESHOLD: 6, // Games starting in < 6h
  MEDIUM_PRIORITY_THRESHOLD: 24, // Games starting in < 24h
} as const

// ============================================
// Season Calculation Helpers
// ============================================

export function getCurrentSeason(sport: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  switch (sport) {
    case 'NBA':
    case 'NCAAB':
      // NBA/College Basketball: October-April, season = start year
      return month >= 10 ? year.toString() : (year - 1).toString()

    case 'NFL':
    case 'NCAAF':
      // NFL/College Football: August-February, season = start year
      return month >= 8 ? year.toString() : (year - 1).toString()

    case 'MLB':
      // MLB: March-October, season = year
      return year.toString()

    case 'NHL':
      // NHL: October-June, season = start year
      return month >= 10 ? year.toString() : (year - 1).toString()

    default:
      return year.toString()
  }
}

export function getTeamAbbreviation(teamName: string, sport: string): string {
  const abbr =
    (sport === 'NBA' && NBA_TEAM_ABBR[teamName]) ||
    (sport === 'NFL' && NFL_TEAM_ABBR[teamName]) ||
    (sport === 'MLB' && MLB_TEAM_ABBR[teamName]) ||
    (sport === 'NHL' && NHL_TEAM_ABBR[teamName])

  if (abbr) return abbr

  // Fallback: generate from team name
  const words = teamName.split(' ')
  if (words.length >= 2) {
    return words[words.length - 1].substring(0, 3).toUpperCase()
  }
  return teamName.substring(0, 3).toUpperCase()
}
