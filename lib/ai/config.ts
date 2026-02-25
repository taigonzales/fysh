export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1024,
  temperature: 0.3,
  maxRetries: 2,
  timeout: 30000, // 30 seconds
} as const;

export const DAILY_TOKEN_BUDGET = 1000000; // ~$3/day at Sonnet pricing
