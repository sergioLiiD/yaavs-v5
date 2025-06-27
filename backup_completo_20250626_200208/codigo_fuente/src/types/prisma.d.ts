import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    salidaAlmacen: {
      create: (args: Prisma.SalidaAlmacenCreateArgs) => Promise<SalidaAlmacen>;
      findMany: (args?: Prisma.SalidaAlmacenFindManyArgs) => Promise<SalidaAlmacen[]>;
      findUnique: (args: Prisma.SalidaAlmacenFindUniqueArgs) => Promise<SalidaAlmacen | null>;
      update: (args: Prisma.SalidaAlmacenUpdateArgs) => Promise<SalidaAlmacen>;
      delete: (args: Prisma.SalidaAlmacenDeleteArgs) => Promise<SalidaAlmacen>;
    };
  }
} 