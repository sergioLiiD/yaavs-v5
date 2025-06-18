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
    const { diagnostico, saludBateria, versionSO } = await request.json();

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

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: {
        ticketId: ticketId
      },
      create: {
        ticketId: ticketId,
        diagnostico: diagnostico,
        saludBateria: saludBateria,
        versionSO: versionSO,
        fechaInicio: new Date()
      },
      update: {
        diagnostico: diagnostico,
        saludBateria: saludBateria,
        versionSO: versionSO
      }
    });

    // Actualizar el estado del ticket
    await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        estatusReparacionId: 2, // En diagnóstico
        fechaInicioDiagnostico: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      reparacion
    });

  } catch (error) {
    console.error('Error al guardar el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al guardar el diagnóstico' },
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

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Obtener el ticket con su reparación
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

    return NextResponse.json({
      success: true,
      reparacion: ticket.reparacion
    });

  } catch (error) {
    console.error('Error al obtener el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el diagnóstico' },
      { status: 500 }
    );
  }
} 