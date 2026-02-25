import {
  buildPropAnalysisPrompt,
  buildCatchOfTheDayPrompt,
  buildGamePreviewPrompt,
  buildParlayEvaluationPrompt,
} from '../index';

describe('Prompt Builders', () => {
  describe('buildPropAnalysisPrompt', () => {
    it('should build a complete prop analysis prompt', () => {
      const context = {
        playerName: 'LeBron James',
        propType: 'Points',
        line: 25.5,
        team: 'Lakers',
        opponent: 'Warriors',
        gameTime: '2024-01-15T19:00:00Z',
        hitRates: {
          last5: 0.8, // 4 of 5
          last10: 0.7, // 7 of 10
          last25: 0.68, // 17 of 25
          season: 0.65, // Season average
          vsOpponent: 0.75, // 3 of 4 vs Warriors
        },
        recentGames: [28, 32, 24, 30, 27], // Last 5 games
        seasonAvg: 26.8,
      };

      const result = buildPropAnalysisPrompt(context);

      // Should contain player info
      expect(result.systemPrompt).toContain('betting analyst');
      expect(result.userPrompt).toContain('LeBron James');
      expect(result.userPrompt).toContain('25.5');
      expect(result.userPrompt).toContain('Points');

      // Should contain hit rate stats
      expect(result.userPrompt).toContain('4 of 5'); // last 5
      expect(result.userPrompt).toContain('7 of 10'); // last 10

      // Should contain recent performance
      expect(result.userPrompt).toContain('28');
      expect(result.userPrompt).toContain('32');

      // Should request JSON format
      expect(result.systemPrompt).toContain('JSON');
      expect(result.systemPrompt.toLowerCase()).toContain('verdict');
      expect(result.systemPrompt.toLowerCase()).toContain('confidence');
    });

    it('should handle props without opponent history', () => {
      const context = {
        playerName: 'Rookie Player',
        propType: 'Points',
        line: 15.5,
        team: 'Spurs',
        opponent: 'Lakers',
        gameTime: '2024-01-15T19:00:00Z',
        hitRates: {
          last5: 0.6,
          last10: 0.5,
          last25: 0.48,
          season: 0.45,
          vsOpponent: null, // Never played this opponent
        },
        recentGames: [18, 12, 14, 20, 16],
        seasonAvg: 14.2,
      };

      const result = buildPropAnalysisPrompt(context);

      expect(result.userPrompt).toContain('Rookie Player');
      // Should gracefully handle null opponent history
      expect(result).toBeDefined();
    });
  });

  describe('buildCatchOfTheDayPrompt', () => {
    it('should build a prompt for selecting the best daily pick', () => {
      const props = [
        {
          id: 'prop-1',
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          team: 'Lakers',
          opponent: 'Warriors',
          hitRate: 0.8,
          edge: 0.12,
        },
        {
          id: 'prop-2',
          playerName: 'Steph Curry',
          propType: 'Threes',
          line: 4.5,
          team: 'Warriors',
          opponent: 'Lakers',
          hitRate: 0.75,
          edge: 0.08,
        },
        {
          id: 'prop-3',
          playerName: 'Anthony Davis',
          propType: 'Rebounds',
          line: 11.5,
          team: 'Lakers',
          opponent: 'Warriors',
          hitRate: 0.85,
          edge: 0.15,
        },
      ];

      const result = buildCatchOfTheDayPrompt(props);

      // Should contain system instructions
      expect(result.systemPrompt).toContain('Catch of the Day');
      expect(result.systemPrompt).toContain('HIGH');
      expect(result.systemPrompt).toContain('LOCK');

      // Should list all candidate props
      expect(result.userPrompt).toContain('LeBron James');
      expect(result.userPrompt).toContain('Steph Curry');
      expect(result.userPrompt).toContain('Anthony Davis');

      // Should include hit rates
      expect(result.userPrompt).toContain('80%');
      expect(result.userPrompt).toContain('85%');

      // Should request JSON format
      expect(result.systemPrompt).toContain('JSON');
    });

    it('should handle empty props list', () => {
      const result = buildCatchOfTheDayPrompt([]);

      expect(result.userPrompt).toContain('No props available');
    });
  });

  describe('buildGamePreviewPrompt', () => {
    it('should build a comprehensive game preview prompt', () => {
      const context = {
        gameId: 'game-123',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        gameTime: '2024-01-15T19:00:00Z',
        venue: 'Crypto.com Arena',
        homeRecord: '25-15',
        awayRecord: '22-18',
        injuries: [
          { team: 'Lakers', player: "D'Angelo Russell", status: 'Questionable' },
          { team: 'Warriors', player: 'Andrew Wiggins', status: 'Out' },
        ],
        trends: {
          homeTeamLast10: '7-3',
          awayTeamLast10: '5-5',
          headToHead: 'Lakers lead season series 2-1',
        },
      };

      const result = buildGamePreviewPrompt(context);

      // Should contain game details
      expect(result.userPrompt).toContain('Lakers');
      expect(result.userPrompt).toContain('Warriors');
      expect(result.userPrompt).toContain('25-15');

      // Should include injury information
      expect(result.userPrompt).toContain("D'Angelo Russell");
      expect(result.userPrompt).toContain('Andrew Wiggins');

      // Should include trends
      expect(result.userPrompt).toContain('7-3');
      expect(result.userPrompt).toContain('season series');

      // Should request betting angles
      expect(result.systemPrompt.toLowerCase()).toContain('betting');
      expect(result.systemPrompt).toContain('JSON');
    });

    it('should handle games with no injuries', () => {
      const context = {
        gameId: 'game-456',
        homeTeam: 'Celtics',
        awayTeam: 'Knicks',
        gameTime: '2024-01-15T19:00:00Z',
        venue: 'TD Garden',
        homeRecord: '30-10',
        awayRecord: '20-20',
        injuries: [],
        trends: {
          homeTeamLast10: '8-2',
          awayTeamLast10: '4-6',
          headToHead: 'Split 1-1',
        },
      };

      const result = buildGamePreviewPrompt(context);

      expect(result.userPrompt).toContain('Celtics');
      expect(result.userPrompt).toContain('No reported injuries');
    });
  });

  describe('buildParlayEvaluationPrompt', () => {
    it('should build a parlay evaluation prompt with all legs', () => {
      const legs = [
        {
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          verdict: 'OVER',
          team: 'Lakers',
          game: 'Lakers vs Warriors',
          hitRate: 0.8,
        },
        {
          playerName: 'Anthony Davis',
          propType: 'Rebounds',
          line: 11.5,
          verdict: 'OVER',
          team: 'Lakers',
          game: 'Lakers vs Warriors',
          hitRate: 0.75,
        },
        {
          playerName: 'Steph Curry',
          propType: 'Threes',
          line: 4.5,
          verdict: 'OVER',
          team: 'Warriors',
          game: 'Lakers vs Warriors',
          hitRate: 0.7,
        },
      ];

      const result = buildParlayEvaluationPrompt(legs);

      // Should list all legs
      expect(result.userPrompt).toContain('Leg 1');
      expect(result.userPrompt).toContain('Leg 2');
      expect(result.userPrompt).toContain('Leg 3');

      // Should include player details
      expect(result.userPrompt).toContain('LeBron James');
      expect(result.userPrompt).toContain('Anthony Davis');
      expect(result.userPrompt).toContain('Steph Curry');

      // Should mention correlation analysis
      expect(result.systemPrompt.toLowerCase()).toContain('correlation');
      expect(result.systemPrompt).toContain('JSON');

      // Should identify same-game legs
      expect(result.userPrompt).toContain('Lakers vs Warriors');
    });

    it('should handle single leg parlay', () => {
      const legs = [
        {
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          verdict: 'OVER',
          team: 'Lakers',
          game: 'Lakers vs Warriors',
          hitRate: 0.8,
        },
      ];

      const result = buildParlayEvaluationPrompt(legs);

      expect(result.userPrompt).toContain('1-leg');
      expect(result.userPrompt).toContain('LeBron James');
      expect(result.userPrompt).toContain('straight bet');
    });

    it('should identify correlation risks for same-game props', () => {
      const legs = [
        {
          playerName: 'LeBron James',
          propType: 'Points',
          line: 25.5,
          verdict: 'OVER',
          team: 'Lakers',
          game: 'Lakers vs Warriors',
          hitRate: 0.8,
        },
        {
          playerName: 'Anthony Davis',
          propType: 'Points',
          line: 22.5,
          verdict: 'OVER',
          team: 'Lakers',
          game: 'Lakers vs Warriors',
          hitRate: 0.75,
        },
      ];

      const result = buildParlayEvaluationPrompt(legs);

      // Should highlight correlation risk
      expect(
        result.userPrompt.toLowerCase().includes('same game') ||
          result.userPrompt.toLowerCase().includes('correlation')
      ).toBe(true);
    });
  });

  describe('Prompt Format Consistency', () => {
    it('should return consistent structure across all prompt builders', () => {
      const propPrompt = buildPropAnalysisPrompt({
        playerName: 'Test',
        propType: 'Points',
        line: 20,
        team: 'Team A',
        opponent: 'Team B',
        gameTime: '2024-01-15T19:00:00Z',
        hitRates: { last5: 0.6, last10: 0.5, last25: 0.5, season: 0.5, vsOpponent: 0.5 },
        recentGames: [20, 22],
        seasonAvg: 21,
      });

      const catchPrompt = buildCatchOfTheDayPrompt([
        {
          id: 'test',
          playerName: 'Test',
          propType: 'Points',
          line: 20,
          team: 'Team A',
          opponent: 'Team B',
          hitRate: 0.8,
          edge: 0.1,
        },
      ]);

      const gamePrompt = buildGamePreviewPrompt({
        gameId: 'test',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        gameTime: '2024-01-15T19:00:00Z',
        venue: 'Arena',
        homeRecord: '20-10',
        awayRecord: '15-15',
        injuries: [],
        trends: { homeTeamLast10: '7-3', awayTeamLast10: '5-5', headToHead: 'Split' },
      });

      const parlayPrompt = buildParlayEvaluationPrompt([
        {
          playerName: 'Test',
          propType: 'Points',
          line: 20,
          verdict: 'OVER',
          team: 'Team A',
          game: 'Game 1',
          hitRate: 0.8,
        },
      ]);

      // All should have systemPrompt and userPrompt
      expect(propPrompt).toHaveProperty('systemPrompt');
      expect(propPrompt).toHaveProperty('userPrompt');

      expect(catchPrompt).toHaveProperty('systemPrompt');
      expect(catchPrompt).toHaveProperty('userPrompt');

      expect(gamePrompt).toHaveProperty('systemPrompt');
      expect(gamePrompt).toHaveProperty('userPrompt');

      expect(parlayPrompt).toHaveProperty('systemPrompt');
      expect(parlayPrompt).toHaveProperty('userPrompt');

      // All systemPrompts should be non-empty strings
      expect(typeof propPrompt.systemPrompt).toBe('string');
      expect(propPrompt.systemPrompt.length).toBeGreaterThan(0);

      expect(typeof catchPrompt.systemPrompt).toBe('string');
      expect(catchPrompt.systemPrompt.length).toBeGreaterThan(0);

      expect(typeof gamePrompt.systemPrompt).toBe('string');
      expect(gamePrompt.systemPrompt.length).toBeGreaterThan(0);

      expect(typeof parlayPrompt.systemPrompt).toBe('string');
      expect(parlayPrompt.systemPrompt.length).toBeGreaterThan(0);
    });
  });
});
