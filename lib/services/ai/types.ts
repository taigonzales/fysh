/**
 * Type definitions for AI services
 */

export interface HitRates {
  hitRateLast5: number;
  hitRateLast10: number;
  hitRateLast25: number;
  hitRateSeason: number;
  hitRateVsOpponent: number;
}

export interface PropAnalysis {
  recommendation: 'OVER' | 'UNDER' | 'PASS';
  recentForm: string;
  matchupAnalysis: string;
  injuryImpact: string;
  bettingValue: string;
  keyFactors: string[];
  confidenceRaw: number; // 0-1 score
}

export interface ConfidenceScore {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'LOCK';
  breakdown: {
    statisticalScore: number;
    aiScore: number;
    trendScore: number;
    valueScore: number;
  };
}

export interface CatchScore {
  propId: string;
  score: number; // 0-100
  confidence: ConfidenceScore;
  hitRates: HitRates;
  analysis: PropAnalysis;
}

export interface SyncResult {
  itemsProcessed: number;
  itemsSkipped: number;
  itemsFailed: number;
  errors: string[];
  duration?: number;
}
