import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data for end-to-end testing...\n');

    // Get an upcoming game
    const upcomingGame = await prisma.game.findFirst({
      where: {
        startTime: {
          gte: new Date(),
        },
        sport: 'NBA',
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    if (!upcomingGame) {
      console.error('❌ No upcoming NBA games found');
      return;
    }

    console.log(`✅ Found game: ${upcomingGame.awayTeam} @ ${upcomingGame.homeTeam}`);
    console.log(`   Start time: ${upcomingGame.startTime.toISOString()}\n`);

    // Create sample player props
    const props = [
      {
        playerName: 'LeBron James',
        playerTeam: upcomingGame.homeTeam,
        propType: 'POINTS',
        line: 25.5,
        overOdds: -110,
        underOdds: -110,
        sportsbook: 'DraftKings',
      },
      {
        playerName: 'Stephen Curry',
        playerTeam: upcomingGame.awayTeam,
        propType: 'THREES_MADE',
        line: 4.5,
        overOdds: -115,
        underOdds: -105,
        sportsbook: 'FanDuel',
      },
      {
        playerName: 'Anthony Davis',
        playerTeam: upcomingGame.homeTeam,
        propType: 'REBOUNDS',
        line: 11.5,
        overOdds: -110,
        underOdds: -110,
        sportsbook: 'DraftKings',
      },
    ];

    console.log('📊 Creating player props...');
    const createdProps = [];
    for (const propData of props) {
      const prop = await prisma.playerProp.create({
        data: {
          gameId: upcomingGame.id,
          ...propData,
          fetchedAt: new Date(),
        },
      });
      createdProps.push(prop);
      console.log(`   ✅ ${prop.playerName} - ${prop.propType} ${prop.line}`);
    }

    // Create sample player season stats with game logs
    console.log('\n📈 Creating player season stats with game logs...');

    // LeBron James - Points prop (line 25.5, hit rate ~70%)
    const lebronGames = [
      { date: '2026-02-23', opponent: upcomingGame.awayTeam, points: 28, rebounds: 8, assists: 9, threesMade: 2 },
      { date: '2026-02-21', opponent: 'Warriors', points: 31, rebounds: 7, assists: 8, threesMade: 3 },
      { date: '2026-02-19', opponent: 'Celtics', points: 22, rebounds: 9, assists: 10, threesMade: 1 },
      { date: '2026-02-17', opponent: 'Bucks', points: 27, rebounds: 6, assists: 7, threesMade: 2 },
      { date: '2026-02-15', opponent: 'Suns', points: 29, rebounds: 8, assists: 11, threesMade: 2 },
      { date: '2026-02-13', opponent: upcomingGame.awayTeam, points: 26, rebounds: 7, assists: 8, threesMade: 2 },
      { date: '2026-02-11', opponent: 'Nuggets', points: 24, rebounds: 9, assists: 6, threesMade: 1 },
      { date: '2026-02-09', opponent: 'Clippers', points: 30, rebounds: 7, assists: 9, threesMade: 3 },
      { date: '2026-02-07', opponent: 'Jazz', points: 25, rebounds: 8, assists: 7, threesMade: 2 },
      { date: '2026-02-05', opponent: 'Spurs', points: 23, rebounds: 6, assists: 8, threesMade: 1 },
    ];

    await prisma.playerSeasonStats.create({
      data: {
        playerName: 'LeBron James',
        sport: 'NBA',
        season: '2025-26',
        teamName: upcomingGame.homeTeam,
        gamesPlayed: 45,
        seasonAvg: {
          points: 25.2,
          rebounds: 7.8,
          assists: 8.1,
          threesMade: 2.1,
        },
        last25Games: lebronGames,
        homeAway: {
          home: { points: 26.1, rebounds: 8.2, assists: 8.3 },
          away: { points: 24.3, rebounds: 7.4, assists: 7.9 },
        },
        vsOpponents: {
          [upcomingGame.awayTeam]: lebronGames.slice(0, 2),
        },
        fetchedAt: new Date(),
      },
    });
    console.log(`   ✅ LeBron James - 25.2 PPG (7/10 games over 25.5)`);

    // Stephen Curry - Threes Made prop (line 4.5, hit rate ~80%)
    const curryGames = [
      { date: '2026-02-23', opponent: upcomingGame.homeTeam, points: 32, rebounds: 5, assists: 7, threesMade: 6 },
      { date: '2026-02-21', opponent: 'Lakers', points: 28, rebounds: 4, assists: 6, threesMade: 5 },
      { date: '2026-02-19', opponent: 'Nets', points: 35, rebounds: 5, assists: 8, threesMade: 7 },
      { date: '2026-02-17', opponent: 'Heat', points: 24, rebounds: 4, assists: 5, threesMade: 4 },
      { date: '2026-02-15', opponent: 'Mavs', points: 29, rebounds: 4, assists: 7, threesMade: 5 },
      { date: '2026-02-13', opponent: upcomingGame.homeTeam, points: 31, rebounds: 5, assists: 6, threesMade: 6 },
      { date: '2026-02-11', opponent: 'Kings', points: 27, rebounds: 4, assists: 6, threesMade: 5 },
      { date: '2026-02-09', opponent: 'Rockets', points: 38, rebounds: 5, assists: 9, threesMade: 8 },
      { date: '2026-02-07', opponent: 'Grizzlies', points: 26, rebounds: 4, assists: 5, threesMade: 5 },
      { date: '2026-02-05', opponent: 'Pelicans', points: 22, rebounds: 3, assists: 6, threesMade: 3 },
    ];

    await prisma.playerSeasonStats.create({
      data: {
        playerName: 'Stephen Curry',
        sport: 'NBA',
        season: '2025-26',
        teamName: upcomingGame.awayTeam,
        gamesPlayed: 48,
        seasonAvg: {
          points: 28.7,
          rebounds: 4.5,
          assists: 6.3,
          threesMade: 5.2,
        },
        last25Games: curryGames,
        homeAway: {
          home: { points: 29.5, rebounds: 4.8, assists: 6.5 },
          away: { points: 27.9, rebounds: 4.2, assists: 6.1 },
        },
        vsOpponents: {
          [upcomingGame.homeTeam]: curryGames.slice(0, 2),
        },
        fetchedAt: new Date(),
      },
    });
    console.log(`   ✅ Stephen Curry - 5.2 3PM (8/10 games over 4.5)`);

    // Anthony Davis - Rebounds prop (line 11.5, hit rate ~60%)
    const davisGames = [
      { date: '2026-02-23', opponent: upcomingGame.awayTeam, points: 26, rebounds: 13, assists: 3, threesMade: 1 },
      { date: '2026-02-21', opponent: 'Warriors', points: 22, rebounds: 10, assists: 2, threesMade: 0 },
      { date: '2026-02-19', opponent: 'Celtics', points: 28, rebounds: 14, assists: 4, threesMade: 1 },
      { date: '2026-02-17', opponent: 'Bucks', points: 24, rebounds: 11, assists: 3, threesMade: 1 },
      { date: '2026-02-15', opponent: 'Suns', points: 21, rebounds: 9, assists: 2, threesMade: 0 },
      { date: '2026-02-13', opponent: upcomingGame.awayTeam, points: 25, rebounds: 12, assists: 3, threesMade: 1 },
      { date: '2026-02-11', opponent: 'Nuggets', points: 27, rebounds: 15, assists: 4, threesMade: 1 },
      { date: '2026-02-09', opponent: 'Clippers', points: 23, rebounds: 10, assists: 2, threesMade: 0 },
      { date: '2026-02-07', opponent: 'Jazz', points: 26, rebounds: 13, assists: 3, threesMade: 1 },
      { date: '2026-02-05', opponent: 'Spurs', points: 24, rebounds: 11, assists: 3, threesMade: 0 },
    ];

    await prisma.playerSeasonStats.create({
      data: {
        playerName: 'Anthony Davis',
        sport: 'NBA',
        season: '2025-26',
        teamName: upcomingGame.homeTeam,
        gamesPlayed: 42,
        seasonAvg: {
          points: 24.1,
          rebounds: 12.3,
          assists: 3.2,
          threesMade: 0.8,
        },
        last25Games: davisGames,
        homeAway: {
          home: { points: 25.3, rebounds: 13.1, assists: 3.4 },
          away: { points: 22.9, rebounds: 11.5, assists: 3.0 },
        },
        vsOpponents: {
          [upcomingGame.awayTeam]: davisGames.slice(0, 2),
        },
        fetchedAt: new Date(),
      },
    });
    console.log(`   ✅ Anthony Davis - 12.3 RPG (6/10 games over 11.5)`);

    // Summary
    console.log('\n✅ Test data seeding complete!');
    console.log('\n📋 Summary:');
    console.log(`   Props created: ${createdProps.length}`);
    console.log(`   Player stats created: 3`);
    console.log('\n🎯 Test Prop IDs:');
    createdProps.forEach((prop) => {
      console.log(`   ${prop.id} - ${prop.playerName} ${prop.propType} ${prop.line}`);
    });

    return createdProps[0].id; // Return first prop ID for testing
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData()
  .then((propId) => {
    if (propId) {
      console.log(`\n🚀 Ready to test! Try this command:`);
      console.log(`   curl http://localhost:3000/api/props/${propId}/analyze`);
    }
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
