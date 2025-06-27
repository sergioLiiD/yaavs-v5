import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const presupuesto = await prisma.presupuesto.update({
    where: { id: 2 },
    data: {
      manoDeObra: 1500,
      subtotal: 5350,
      iva: 856,
      total: 6206,
      saldo: 6206,
      aprobado: true,
      fechaAprobacion: new Date()
    }
  });

  console.log('Presupuesto actualizado:', presupuesto);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 