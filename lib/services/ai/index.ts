/**
 * AI Services
 * Barrel export for all AI analysis services
 */

// Catch of the Day
export {
  selectCatchOfTheDay,
  generateCatchOfTheDay,
  getTodaysCatch,
  batchGenerateDailyCatches,
  type CatchOfTheDayResult,
} from './catch-of-day';

// Game Preview
export {
  generateGamePreview,
  getGamePreview,
  batchGenerateGamePreviews,
  type GamePreviewResult,
} from './game-preview';

// Parlay Evaluator
export {
  evaluateParlay,
  type ParlayLegInput,
  type ParlayEvaluationResult,
} from './parlay-evaluator';

// Prop Analyzer
export {
  analyzeProp,
  batchAnalyzeProps,
  type PropAnalysisResult,
} from './prop-analyzer';

// Hit Rate Calculator
export { calculateAllHitRates, type HitRateResult } from './hit-rate-calculator';

// Types
export type { HitRates, SyncResult } from './types';

// Utilities
export { withLock, createSyncResult, logSyncResult, sleep } from './utils';
