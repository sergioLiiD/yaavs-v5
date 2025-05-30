import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const ticket = await prisma.ticket.findUnique({
    where: { id: 2 },
    include: {
      Reparacion: true,
      dispositivo: true
    }
  });

  console.log('Ticket:', ticket);

  // Verificar si hay registros en la tabla de reparaciones
  const reparaciones = await prisma.reparacion.findMany({
    where: { ticketId: 2 }
  });
  console.log('Reparaciones encontradas:', reparaciones);

  // Verificar si hay registros en la tabla de checklist
  const checklist = await prisma.checklistDiagnostico.findMany({
    where: {
      reparacion: {
        ticketId: 2
      }
    }
  });
  console.log('Items de checklist encontrados:', checklist);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 