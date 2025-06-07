import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

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

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id,
        activo: true
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntos_recoleccion.isRepairPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Obtener el ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        activo: true
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        modelo: {
          select: {
            nombre: true,
            marcas: {
              select: {
                nombre: true
              }
            }
          }
        },
        estatusReparacion: {
          select: {
            nombre: true
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

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id,
        activo: true
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntos_recoleccion.isRepairPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Verificar que el ticket existe y pertenece al punto de reparación
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: params.id,
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        activo: true
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el ticket
    const updatedTicket = await prisma.ticket.update({
      where: {
        id: params.id
      },
      data: {
        estatusReparacionId: body.estatusReparacionId
      },
      include: {
        cliente: {
          select: {
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true
          }
        },
        modelo: {
          select: {
            nombre: true,
            marcas: {
              select: {
                nombre: true
              }
            }
          }
        },
        estatusReparacion: {
          select: {
            nombre: true
          }
        }
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    );
  }
} 