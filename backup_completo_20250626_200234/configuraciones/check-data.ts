import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Tipos de Servicio ===');
  const tiposServicio = await prisma.tipoServicio.findMany();
  console.log(tiposServicio);

  console.log('\n=== Precios de Venta ===');
  const preciosVenta = await prisma.precioVenta.findMany({
    include: {
      servicio: true,
      producto: true
    }
  });
  console.log(JSON.stringify(preciosVenta, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 