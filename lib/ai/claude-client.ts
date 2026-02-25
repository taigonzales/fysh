import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { AI_CONFIG } from './config';

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Basic text analysis with Claude
   */
  async analyze(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const response = await this.client.messages.create({
      model: options?.model || AI_CONFIG.model,
      max_tokens: options?.maxTokens || AI_CONFIG.maxTokens,
      temperature: options?.temperature ?? AI_CONFIG.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  }

  /**
   * Structured analysis with JSON output validated by Zod schema
   */
  async analyzeStructured<T extends z.ZodTypeAny>(
    systemPrompt: string,
    userPrompt: string,
    schema: T,
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<z.infer<T>> {
    // Enhance system prompt to enforce JSON
    const jsonSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond with ONLY valid JSON. Do not include any text before or after the JSON object.`;

    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const text = await this.analyze(jsonSystemPrompt, userPrompt, options);

        // Extract JSON from response (handles cases where Claude adds text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return schema.parse(parsed);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw new Error(
            `Failed to parse structured response after ${maxAttempts} attempts: ${error}`
          );
        }
        // Retry once
      }
    }

    throw new Error('Unreachable');
  }
}
