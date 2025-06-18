import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const { checklist } = await request.json();

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntoRecoleccion.isRepairPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Verificar que el ticket exista y pertenezca al punto de reparación
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        puntoRecoleccionId: userPoint.puntoRecoleccionId
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Crear o actualizar las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item: any) => {
        return prisma.respuestaChecklistReparacion.upsert({
          where: {
            ticketId_itemId: {
              ticketId: ticketId,
              itemId: item.itemId
            }
          },
          create: {
            ticketId: ticketId,
            itemId: item.itemId,
            respuesta: item.respuesta,
            observaciones: item.observacion || ''
          },
          update: {
            respuesta: item.respuesta,
            observaciones: item.observacion || ''
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      checklist: respuestas
    });

  } catch (error) {
    console.error('Error al guardar el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al guardar el checklist de reparación' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntoRecoleccion.isRepairPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Verificar que el ticket exista y pertenezca al punto de reparación
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        puntoRecoleccionId: userPoint.puntoRecoleccionId
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Obtener el checklist de reparación
    const checklist = await prisma.respuestaChecklistReparacion.findMany({
      where: {
        ticketId: ticketId
      },
      include: {
        item: true
      }
    });

    return NextResponse.json({
      success: true,
      checklist
    });

  } catch (error) {
    console.error('Error al obtener el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de reparación' },
      { status: 500 }
    );
  }
} 