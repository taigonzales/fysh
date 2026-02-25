export const AI_CONFIG = {
  model: 'llama-3.3-70b-versatile', // Groq's best free model
  maxTokens: 1024,
  temperature: 0.3,
  maxRetries: 2,
  timeout: 30000, // 30 seconds
} as const;

export const DAILY_TOKEN_BUDGET = 14400; // Groq free tier: 14,400 requests/day
