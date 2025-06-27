import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const estados = await prisma.estatusReparacion.findMany({
    orderBy: {
      orden: 'asc'
    }
  });

  console.log('Estados de reparación en la base de datos:');
  estados.forEach(estado => {
    console.log(`${estado.orden}. ${estado.nombre} - ${estado.descripcion}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 