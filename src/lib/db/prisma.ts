import { PrismaClient } from '@prisma/client';

// Prevenir múltiples instancias de Prisma en desarrollo
// Ver: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Manejar errores de conexión
prisma.$on('query' as any, (e: any) => {
  console.log('Query:', e.query);
  console.log('Params:', e.params);
  console.log('Duration:', `${e.duration}ms`);
});

prisma.$on('error' as any, (e: any) => {
  console.error('Error de Prisma:', e);
});

export default prisma; 