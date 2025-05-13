import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicket() {
  try {
    // Verificar el ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: 2 },
      include: {
        reparacion: true,
        dispositivo: true,
        cliente: true,
        modelo: {
          include: {
            marca: true
          }
        }
      }
    });

    console.log('Ticket encontrado:', ticket);

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

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicket(); 