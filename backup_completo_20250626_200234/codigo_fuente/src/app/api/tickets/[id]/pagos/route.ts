import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Obtener el historial de pagos
    const pagos = await prisma.pago.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 