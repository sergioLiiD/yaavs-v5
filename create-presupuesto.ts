import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const presupuesto = await prisma.presupuesto.create({
    data: {
      ticketId: 2,
      manoDeObra: 1500,
      subtotal: 3850,
      iva: 616,
      total: 4466,
      anticipo: 0,
      saldo: 4466,
      aprobado: true,
      fechaAprobacion: new Date(),
    },
  });

  console.log('Presupuesto creado:', presupuesto);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 