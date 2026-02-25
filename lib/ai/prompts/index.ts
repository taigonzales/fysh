/**
 * Prompt builders for Claude AI analysis
 *
 * Each builder returns a systemPrompt and userPrompt that can be used
 * with ClaudeClient.analyzeStructured() along with the corresponding Zod schema.
 */

export {
  buildPropAnalysisPrompt,
  type PropAnalysisContext,
  type PromptResult as PropAnalysisPromptResult,
} from './prop-analysis';

export {
  buildCatchOfTheDayPrompt,
  type CatchCandidateProp,
  type PromptResult as CatchOfTheDayPromptResult,
} from './catch-of-the-day';

export {
  buildGamePreviewPrompt,
  type GamePreviewContext,
  type PromptResult as GamePreviewPromptResult,
} from './game-preview';

export {
  buildParlayEvaluationPrompt,
  type ParlayLeg,
  type PromptResult as ParlayEvaluationPromptResult,
} from './parlay-evaluation';

// Re-export PromptResult type for convenience
export type { PromptResult } from './prop-analysis';
