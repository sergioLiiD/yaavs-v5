import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando petición GET /api/tickets/[id]/piezas-reparacion');
    const session = await getServerSession(authOptions);
    console.log('Sesión completa:', JSON.stringify(session, null, 2));
    
    if (!session?.user) {
      console.log('No hay sesión activa');
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    const ticketId = parseInt(params.id);
    console.log('Buscando ticket:', ticketId);

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    const reparacion = await prisma.reparacion.findFirst({
      where: { ticketId: ticketId },
    });

    if (!reparacion) {
      console.log('Reparación no encontrada');
      return new NextResponse('Reparación no encontrada', { status: 404 });
    }

    console.log('Reparación encontrada:', reparacion);

    // Obtener las piezas de reparación
    const piezasReparacion = await prisma.piezaReparacion.findMany({
      where: {
        reparacionId: reparacion.id
      },
      include: {
        pieza: {
          include: {
            marca: true,
            modelo: true
          }
        }
      }
    });

    console.log('Piezas de reparación encontradas:', piezasReparacion);
    return NextResponse.json(piezasReparacion);
  } catch (error) {
    console.error('Error al obtener piezas de reparación:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 