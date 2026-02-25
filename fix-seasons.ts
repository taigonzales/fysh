import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSeasons() {
  console.log('Updating player stats seasons to match games...');
  
  const result = await prisma.playerSeasonStats.updateMany({
    where: { season: '2025-26' },
    data: { season: '2025' },
  });
  
  console.log(`✅ Updated ${result.count} player stats records`);
  
  await prisma.$disconnect();
}

fixSeasons();
