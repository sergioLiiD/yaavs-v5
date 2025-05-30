import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Primero, vamos a verificar los tipos disponibles
  const ticket = await prisma.ticket.findUnique({
    where: { id: 2 },
    include: {
      Reparacion: true,
      dispositivos: true
    }
  });

  console.log('Ticket:', ticket);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 