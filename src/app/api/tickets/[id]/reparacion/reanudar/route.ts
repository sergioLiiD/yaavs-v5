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

    // Verificar si el ticket existe y tiene una reparación
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { reparacion: true }
    });

    if (!ticket || !ticket.reparacion) {
      return new NextResponse('Reparación no encontrada', { status: 404 });
    }

    // Actualizar la reparación con la fecha de reanudación
    const reparacion = await prisma.reparacion.update({
      where: { ticketId },
      data: {
        fechaReanudacion: new Date(),
        fechaPausa: null // Aseguramos que no haya fecha de pausa
      }
    });

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al reanudar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al reanudar la reparación' },
      { status: 500 }
    );
  }
} 