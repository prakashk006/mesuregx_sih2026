const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function init() {
  console.log('[MESUREGX] Pushing database schema to PostgreSQL...');
  try {
    execSync('npx --yes prisma@5.22.0 db push --accept-data-loss', { stdio: 'inherit' });
    console.log('[MESUREGX] Database schema synchronized successfully.');

    const userCount = await prisma.user.count().catch(() => 0);
    if (userCount === 0) {
      console.log('[MESUREGX] Empty database detected. Seeding initial demo accounts...');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('[MESUREGX] Database seeded successfully.');
    } else {
      console.log(`[MESUREGX] Existing database found with ${userCount} users. Ready!`);
    }
  } catch (err) {
    console.error('[MESUREGX] Database initialization error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

init();
