import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ticket = await prisma.ticket.findUnique({
    where: { id: 3 },
    include: { presupuesto: true }
  });

  console.log('Ticket:', ticket);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 