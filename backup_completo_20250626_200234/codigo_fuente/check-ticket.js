const { PrismaClient } = require('@prisma/client');
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

    console.log('Ticket encontrado:', JSON.stringify(ticket, null, 2));

    // Verificar si hay registros en la tabla de reparaciones
    const reparaciones = await prisma.reparacion.findMany({
      where: { ticketId: 2 }
    });
    console.log('Reparaciones encontradas:', JSON.stringify(reparaciones, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicket(); 