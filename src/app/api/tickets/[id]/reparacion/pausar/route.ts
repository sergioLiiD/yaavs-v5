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
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);

    // Verificar que el ticket existe y está en reparación
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.reparacion) {
      return new NextResponse('El ticket no tiene una reparación iniciada', { status: 400 });
    }

    // Actualizar la reparación con la fecha de pausa
    const reparacion = await prisma.reparacion.update({
      where: { ticketId },
      data: {
        fechaPausa: new Date(),
        fechaReanudacion: null
      }
    });

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al pausar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al pausar la reparación' },
      { status: 500 }
    );
  }
} 