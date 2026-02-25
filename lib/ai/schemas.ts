import { z } from 'zod';

/**
 * Schema for AI-powered prop analysis
 * Used to validate Claude's structured JSON responses
 */
export const PropAnalysisSchema = z.object({
  verdict: z.enum(['OVER', 'UNDER', 'SKIP']),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH', 'LOCK']),
  summary: z.string().min(1, 'Summary is required'),
  analysis: z.string().min(1, 'Analysis is required'),
  key_factors: z.array(z.string()).default([]),
  risk_factors: z.array(z.string()).default([]),
  edge_estimate: z.string().min(1, 'Edge estimate is required'),
});

export type PropAnalysis = z.infer<typeof PropAnalysisSchema>;

/**
 * Schema for "Catch of the Day" featured pick
 * Daily AI-curated recommendation with detailed breakdown
 */
export const CatchOfTheDaySchema = z.object({
  propId: z.string(),
  playerName: z.string(),
  market: z.string(),
  line: z.number(),
  verdict: z.enum(['OVER', 'UNDER']),
  confidence: z.enum(['HIGH', 'LOCK']),
  headline: z.string().min(1),
  summary: z.string().min(1),
  key_factors: z.array(z.string()),
  edge_estimate: z.string(),
  value_score: z.number().min(0).max(100),
});

export type CatchOfTheDay = z.infer<typeof CatchOfTheDaySchema>;

/**
 * Schema for AI-generated game preview
 * Pre-game analysis with key storylines and betting angles
 */
export const GamePreviewSchema = z.object({
  gameId: z.string(),
  headline: z.string().min(1),
  summary: z.string().min(1),
  key_storylines: z.array(z.string()).min(1),
  injury_impact: z.string(),
  betting_angles: z.array(
    z.object({
      market: z.string(),
      angle: z.string(),
      confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    })
  ),
  value_plays: z.array(z.string()),
});

export type GamePreview = z.infer<typeof GamePreviewSchema>;

/**
 * Schema for parlay evaluation
 * Assesses correlation risk and overall parlay quality
 */
export const ParlayEvaluationSchema = z.object({
  overall_grade: z.enum(['A', 'B', 'C', 'D', 'F']),
  confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  summary: z.string().min(1),
  correlation_risks: z.array(
    z.object({
      legs: z.array(z.number()), // Indices of correlated legs
      risk: z.string(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    })
  ),
  independent_analysis: z.array(
    z.object({
      legIndex: z.number(),
      verdict: z.enum(['STRONG', 'GOOD', 'WEAK', 'AVOID']),
      reasoning: z.string(),
    })
  ),
  recommendation: z.enum(['BUILD', 'PROCEED', 'RECONSIDER', 'AVOID']),
  suggested_improvements: z.array(z.string()).optional(),
});

export type ParlayEvaluation = z.infer<typeof ParlayEvaluationSchema>;
