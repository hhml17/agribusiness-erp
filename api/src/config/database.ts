/**
 * Database Configuration - Prisma 7 compatible
 */
import { PrismaClient } from '@prisma/client';

// En Prisma 7, si no usas Prisma Accelerate, 
// pasamos la URL directamente en el objeto de configuración.
export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL as string,
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Test database connection on initialization
// Nota: En servidores (como Azure), es mejor no desconectar Prisma manualmente
// a menos que el proceso se apague por completo.
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Mostramos parte de la URL para verificar conexión sin exponer la contraseña
    const host = process.env.DATABASE_URL?.split('@')[1]?.split(';')[0] || 
                 process.env.DATABASE_URL?.split('//')[1]?.split(':')[0];
    console.log('📊 Connected to Server:', host || 'Local/Configured');
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('DATABASE_URL is set:', !!process.env.DATABASE_URL);
  }
}

connectDB();

// Manejo de cierre elegante
// En lugar de 'beforeExit' (que a veces causa re-conexiones), 
// usamos SIGINT o SIGTERM para procesos de Node modernos.
const gracefulShutdown = async () => {
  console.log('🔌 Disconnecting from database...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);