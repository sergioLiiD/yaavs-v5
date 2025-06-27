import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

type ChecklistItem = {
  itemId: number;
  respuesta: boolean;
  observacion?: string;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsRepairPoint);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const { checklist } = await request.json() as { checklist: ChecklistItem[] };

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    if (!userPoint) {
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
      },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (!ticket.reparacion) {
      return NextResponse.json(
        { error: 'El ticket no tiene una reparación asociada' },
        { status: 400 }
      );
    }

    // Buscar el checklist existente
    const existingChecklist = await prisma.checklistReparacion.findUnique({
      where: {
        reparacionId: ticket.reparacion.id
      }
    });

    // Si no existe el checklist, crearlo
    const checklistReparacion = existingChecklist || await prisma.checklistReparacion.create({
      data: {
        reparacionId: ticket.reparacion.id
      }
    });

    // Crear o actualizar las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item) => {
        // Buscar si ya existe una respuesta para este item
        const existingRespuesta = await prisma.checklistRespuestaReparacion.findFirst({
          where: {
            checklistReparacionId: checklistReparacion.id,
            checklistItemId: item.itemId
          }
        });

        if (existingRespuesta) {
          // Si existe, actualizarla
          return prisma.checklistRespuestaReparacion.update({
            where: {
              id: existingRespuesta.id
            },
            data: {
              respuesta: item.respuesta,
              observaciones: item.observacion || null
            }
          });
        } else {
          // Si no existe, crearla
          return prisma.checklistRespuestaReparacion.create({
            data: {
              checklistReparacionId: checklistReparacion.id,
              checklistItemId: item.itemId,
              respuesta: item.respuesta,
              observaciones: item.observacion || null
            }
          });
        }
      })
    );

    return NextResponse.json({
      success: true,
      respuestas
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
    const session = await getServerSession(authOptionsRepairPoint);

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

    if (!userPoint) {
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
      },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (!ticket.reparacion) {
      return NextResponse.json(
        { error: 'El ticket no tiene una reparación asociada' },
        { status: 400 }
      );
    }

    // Obtener el checklist de reparación con sus respuestas
    const checklistReparacion = await prisma.checklistReparacion.findUnique({
      where: {
        reparacionId: ticket.reparacion.id
      },
      include: {
        respuestas: {
          include: {
            checklistItem: true
          }
        }
      }
    });

    const checklist = checklistReparacion?.respuestas || [];

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