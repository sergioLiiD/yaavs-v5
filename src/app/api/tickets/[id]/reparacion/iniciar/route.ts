import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando endpoint de reparación...');
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    const ticketId = parseInt(params.id);
    console.log('ID del ticket:', ticketId);

    // Verificar si el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { 
        reparacion: true,
        pagos: true
      }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    console.log('Ticket encontrado:', ticket);

    // Verificar si hay pagos realizados
    if (!ticket.pagos || ticket.pagos.length === 0) {
      console.log('No hay pagos registrados');
      return new NextResponse('No se puede iniciar la reparación sin un pago registrado', { status: 400 });
    }

    // Si ya existe una reparación, actualizar la fecha de inicio
    if (ticket.reparacion) {
      console.log('Actualizando reparación existente');
      const reparacion = await prisma.reparacion.update({
        where: { ticketId },
        data: {
          fechaInicio: new Date(),
        }
      });
      console.log('Reparación actualizada:', reparacion);
      return NextResponse.json(reparacion);
    }

    // Si no existe una reparación, crearla
    console.log('Creando nueva reparación');
    const reparacion = await prisma.reparacion.create({
      data: {
        ticketId,
        tecnicoId: parseInt(session.user.id),
        fechaInicio: new Date(),
      }
    });
    console.log('Nueva reparación creada:', reparacion);

    // Actualizar el estado del ticket a "En Reparación"
    const ticketActualizado = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estatusReparacionId: 4, // 4 = En Reparación
      }
    });
    console.log('Estado del ticket actualizado:', ticketActualizado);

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al iniciar la reparación:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 