import { describe, it, expect, beforeEach } from '@jest/globals';
import { z } from 'zod';
import { ClaudeClient } from '../claude-client';

describe('ClaudeClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze with basic prompt and return text', async () => {
    const client = new ClaudeClient();
    const result = await client.analyze(
      'You are a helpful assistant.',
      'Say hello',
      { maxTokens: 50 }
    );

    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should analyze with structured output and validate with Zod', async () => {
    const client = new ClaudeClient();
    const schema = z.object({
      verdict: z.enum(['OVER', 'UNDER', 'SKIP']),
      confidence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    });

    const result = await client.analyzeStructured(
      'You are a betting analyst. Respond only in valid JSON.',
      'Analyze this: LeBron James over 25.5 points. Respond with verdict and confidence.',
      schema
    );

    expect(result.verdict).toMatch(/OVER|UNDER|SKIP/);
    expect(result.confidence).toMatch(/LOW|MEDIUM|HIGH/);
  });

  it('should handle API errors gracefully', async () => {
    const client = new ClaudeClient('invalid-key');

    await expect(client.analyze('System', 'User')).rejects.toThrow();
  });
});
