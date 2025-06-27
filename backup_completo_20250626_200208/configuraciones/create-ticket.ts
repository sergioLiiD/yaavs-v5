import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Obtener el estado "Recibido"
    const estadoRecibido = await prisma.estatusReparacion.findFirst({
      where: { nombre: 'Recibido' }
    });

    if (!estadoRecibido) {
      throw new Error('No se encontró el estado "Recibido"');
    }

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TICK-${Date.now()}`,
        clienteId: 1,
        tipoServicioId: 1,
        modeloId: 1,
        descripcionProblema: 'iPhone 16 Pro con pantalla rota',
        estatusReparacionId: estadoRecibido.id,
        creadorId: 1,
        tecnicoAsignadoId: 1,
      },
      include: {
        cliente: true,
        modelo: true,
        tipoServicio: true,
        estatusReparacion: true,
        creador: true,
        tecnicoAsignado: true,
      }
    });

    console.log('Ticket creado:', ticket);
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 