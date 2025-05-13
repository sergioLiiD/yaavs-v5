import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { observaciones } = await request.json();
    const ticketId = parseInt(params.id);

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: true,
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Actualizar la reparación
    const reparacion = await prisma.reparacion.update({
      where: {
        ticketId: ticketId,
      },
      data: {
        observaciones,
        fechaFin: new Date(),
      },
    });

    // Actualizar el estado del ticket a "Entregado"
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estatusReparacionId: 8, // ID del estado "Entregado"
      },
    });

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 