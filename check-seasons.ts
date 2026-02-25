import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeasons() {
  const game = await prisma.game.findFirst({
    where: { id: 'cfa5c7ab-a69f-49b2-9bd4-2782af724179'.substring(0, 10) },
  });
  
  const anyGame = await prisma.game.findFirst();
  console.log('Sample game season:', anyGame?.season);
  
  const stats = await prisma.playerSeasonStats.findMany({
    select: { playerName: true, season: true, sport: true },
  });
  console.log('Player stats:', stats);
  
  await prisma.$disconnect();
}

checkSeasons();
