/**
 * Database Configuration - Prisma 7 compatible
 * Según las reglas de codificación obligatorias del proyecto
 */
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Manejo de señales para cierre elegante (CRÍTICO para Azure)
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} recibido, cerrando Prisma...`);
  await prisma.$disconnect();
  console.log('✅ Prisma desconectado');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
