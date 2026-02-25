/**
 * Shared utilities for AI services
 */
import type { SyncResult } from './types';

/**
 * Create empty sync result
 */
export function createSyncResult(): SyncResult {
  return {
    itemsProcessed: 0,
    itemsSkipped: 0,
    itemsFailed: 0,
    errors: [],
  };
}

/**
 * Log sync result to console
 */
export function logSyncResult(serviceName: string, result: SyncResult): void {
  const { itemsProcessed, itemsSkipped, itemsFailed, errors, duration } = result;

  console.log(`[${serviceName}] Sync complete:`, {
    processed: itemsProcessed,
    skipped: itemsSkipped,
    failed: itemsFailed,
    duration: duration ? `${duration}ms` : 'N/A',
  });

  if (errors.length > 0) {
    console.error(`[${serviceName}] Errors:`, errors);
  }
}

/**
 * Simple in-memory lock to prevent concurrent runs
 */
const locks = new Map<string, boolean>();

export async function withLock<T>(
  lockName: string,
  fn: () => Promise<T>
): Promise<T | null> {
  if (locks.get(lockName)) {
    console.warn(`[Lock] ${lockName} is already running, skipping`);
    return null;
  }

  locks.set(lockName, true);

  try {
    return await fn();
  } finally {
    locks.delete(lockName);
  }
}

/**
 * Calculate percentage (hit rate)
 */
export function calculatePercentage(hits: number, total: number): number {
  if (total === 0) return 0;
  return Number((hits / total).toFixed(4)); // 4 decimal places
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
