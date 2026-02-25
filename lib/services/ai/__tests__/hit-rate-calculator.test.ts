/**
 * @jest-environment node
 */
import { describe, test, expect } from '@jest/globals';
import { calculateHitRateFromGames, calculateAllHitRates } from '../hit-rate-calculator';
import type { GameLog } from '@/lib/api/stats-api';

describe('Hit Rate Calculator', () => {
  const mockGames: GameLog[] = [
    { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 32 },
    { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 28 },
    { date: '2024-02-16', opponent: 'PHI', isHome: true, points: 24 },
    { date: '2024-02-14', opponent: 'BKN', isHome: false, points: 30 },
    { date: '2024-02-12', opponent: 'LAL', isHome: true, points: 35 },
  ];

  test('calculates hit rate for last 5 games', () => {
    const line = 27.5;
    const statField = 'points';

    const hitRate = calculateHitRateFromGames(mockGames, line, statField);

    // 4 out of 5 games over 27.5 points (32, 28, 30, 35)
    expect(hitRate).toBe(0.8);
  });

  test('calculates hit rate for empty games array', () => {
    const hitRate = calculateHitRateFromGames([], 27.5, 'points');
    expect(hitRate).toBe(0);
  });

  test('calculates hit rate for all misses', () => {
    const lowGames: GameLog[] = [
      { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 10 },
      { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 12 },
    ];

    const hitRate = calculateHitRateFromGames(lowGames, 27.5, 'points');
    expect(hitRate).toBe(0);
  });

  test('calculates hit rate for all hits', () => {
    const highGames: GameLog[] = [
      { date: '2024-02-20', opponent: 'LAL', isHome: true, points: 40 },
      { date: '2024-02-18', opponent: 'MIA', isHome: false, points: 38 },
    ];

    const hitRate = calculateHitRateFromGames(highGames, 27.5, 'points');
    expect(hitRate).toBe(1.0);
  });

  test('filters games by opponent', () => {
    const vsLAL = mockGames.filter((g) => g.opponent === 'LAL');
    const hitRate = calculateHitRateFromGames(vsLAL, 27.5, 'points');

    // 2 games vs LAL: 32 and 35 (both over 27.5)
    expect(hitRate).toBe(1.0);
  });

  // Integration test - requires database setup
  // TODO: Enable once PlayerSeasonStats table is populated with test data
  /*
  test('calculates all hit rates for a prop', async () => {
    const mockPropId = 'test-prop-123';

    const hitRates = await calculateAllHitRates(mockPropId);

    expect(hitRates).toBeDefined();
    expect(hitRates.hitRateLast5).toBeGreaterThanOrEqual(0);
    expect(hitRates.hitRateLast5).toBeLessThanOrEqual(1);
  });
  */
});
