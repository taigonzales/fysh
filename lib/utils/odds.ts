/**
 * Format American odds with + sign for positive odds
 */
export function formatOdds(odds: number, showSign = true): string {
  if (odds > 0 && showSign) {
    return `+${odds}`
  }
  return odds.toString()
}

/**
 * Calculate implied probability from American odds
 */
export function calculateImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100)
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100)
  }
}

/**
 * Calculate potential payout from stake and odds
 */
export function calculatePayout(stake: number, odds: number): number {
  if (odds > 0) {
    return stake * (odds / 100)
  } else {
    return stake * (100 / Math.abs(odds))
  }
}

/**
 * Calculate parlay odds from multiple legs
 */
export function calculateParlayOdds(odds: number[]): number {
  const decimalOdds = odds.map(americanToDecimal)
  const combinedDecimal = decimalOdds.reduce((acc, odd) => acc * odd, 1)
  return decimalToAmerican(combinedDecimal)
}

function americanToDecimal(american: number): number {
  if (american > 0) {
    return american / 100 + 1
  } else {
    return 100 / Math.abs(american) + 1
  }
}

function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100)
  } else {
    return Math.round(-100 / (decimal - 1))
  }
}
