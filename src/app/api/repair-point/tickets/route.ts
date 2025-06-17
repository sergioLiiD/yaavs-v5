import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener el punto de recolección asociado al usuario
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
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener los tickets asociados al punto de recolección
    const tickets = await prisma.ticket.findMany({
      where: {
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        cancelado: false
      },
      include: {
        cliente: true,
        modelo: {
          include: {
            marca: true
          }
        },
        estatusReparacion: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de recolección del usuario
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
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Obtener el estatus inicial "Recibido"
    const estatusInicial = await prisma.estatusReparacion.findFirst({
      where: { 
        nombre: 'Recibido',
        activo: true
      }
    });

    if (!estatusInicial) {
      console.error('No se encontró el estatus inicial "Recibido"');
      return NextResponse.json(
        { error: 'No se encontró el estatus inicial' },
        { status: 500 }
      );
    }

    console.log('Estatus inicial encontrado:', estatusInicial);

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        numeroTicket: `TICK-${Date.now()}`,
        descripcionProblema: body.descripcionProblema,
        imei: body.imei,
        capacidad: body.capacidad,
        color: body.color,
        fechaCompra: body.fechaCompra ? new Date(body.fechaCompra) : null,
        tipoDesbloqueo: body.tipoDesbloqueo,
        codigoDesbloqueo: body.tipoDesbloqueo === 'pin' ? body.codigoDesbloqueo : null,
        patronDesbloqueo: body.tipoDesbloqueo === 'patron' ? body.patronDesbloqueo : [],
        redCelular: body.redCelular,
        cancelado: false,
        cliente: {
          connect: {
            id: parseInt(body.clienteId)
          }
        },
        modelo: {
          connect: {
            id: parseInt(body.modeloId)
          }
        },
        creador: {
          connect: {
            id: session.user.id
          }
        },
        estatusReparacion: {
          connect: {
            id: estatusInicial.id
          }
        },
        puntoRecoleccion: {
          connect: {
            id: userPoint.puntoRecoleccionId
          }
        },
        tipoServicio: {
          connect: {
            id: parseInt(body.tipoServicioId) || 1 // Usar 1 como valor por defecto si no hay tipoServicioId
          }
        }
      }
    });

    console.log('Ticket creado:', ticket);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    );
  }
} 