/**
 * Database Configuration
 * Prisma Client initialization with logging and error handling
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Test database connection on initialization
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    console.log('📊 Database URL:', process.env.DATABASE_URL?.split('@')[1]?.split(';')[0] || 'Not configured');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('DATABASE_URL configured:', !!process.env.DATABASE_URL);
    // Don't exit - let the app try to recover
  });

// Handle graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
});
