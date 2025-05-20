import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.entradaAlmacen.updateMany({
    where: { proveedorId: null as any },
    data: { proveedorId: 1 },
  });
  console.log(`Entradas actualizadas: ${updated.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 