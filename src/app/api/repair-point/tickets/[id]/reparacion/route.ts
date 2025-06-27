import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const { observaciones, checklist, fotos, videos, completar } = await request.json();

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
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar la reparación
    const reparacion = await prisma.reparacion.update({
      where: {
        ticketId: ticketId
      },
      data: {
        observaciones,
        fechaFin: completar ? new Date() : undefined
      }
    });

    // Si se está completando la reparación, actualizar el estado del ticket
    if (completar) {
      await prisma.ticket.update({
        where: {
          id: ticketId
        },
        data: {
          estatusReparacionId: 4, // Completado
          fechaFinReparacion: new Date()
        }
      });
    }

    // Guardar el checklist si se proporcionó
    if (checklist && checklist.length > 0) {
      // Crear o actualizar el checklist de reparación
      const checklistReparacion = await prisma.checklistReparacion.upsert({
        where: {
          reparacionId: reparacion.id
        },
        create: {
          reparacionId: reparacion.id
        },
        update: {}
      });

      // Eliminar respuestas existentes
      await prisma.checklistRespuestaReparacion.deleteMany({
        where: {
          checklistReparacionId: checklistReparacion.id
        }
      });

      // Crear nuevas respuestas
      await Promise.all(
        checklist.map((item: any) =>
          prisma.checklistRespuestaReparacion.create({
            data: {
              checklistReparacionId: checklistReparacion.id,
              checklistItemId: item.itemId,
              respuesta: item.respuesta,
              observaciones: item.observacion || null
            }
          })
        )
      );
    }

    // Guardar las fotos y videos si se proporcionaron
    if (fotos && fotos.length > 0) {
      await Promise.all(
        fotos.map((foto: string) =>
          prisma.archivoReparacion.create({
            data: {
              ticketId: ticketId,
              tipo: 'FOTO',
              url: foto
            }
          })
        )
      );
    }

    if (videos && videos.length > 0) {
      await Promise.all(
        videos.map((video: string) =>
          prisma.archivoReparacion.create({
            data: {
              ticketId: ticketId,
              tipo: 'VIDEO',
              url: video
            }
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      reparacion
    });

  } catch (error) {
    console.error('Error al guardar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al guardar la reparación' },
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
        reparacion: {
          include: {
            archivos: true
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reparacion: ticket.reparacion
    });

  } catch (error) {
    console.error('Error al obtener la reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener la reparación' },
      { status: 500 }
    );
  }
} 