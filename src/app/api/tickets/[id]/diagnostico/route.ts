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
    const { descripcion, saludBateria, versionSistema } = await request.json();

    // Validar que el ticket exista
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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

    // Validar que el usuario sea el técnico asignado o tenga permisos adecuados
    if (ticket.tecnicoAsignadoId !== session.user.id) {
      const hasRepairPermission = session.user.permissions?.includes('REPAIRS_EDIT');
      if (!hasRepairPermission) {
        return NextResponse.json(
          { error: 'No tienes permiso para realizar esta acción' },
          { status: 403 }
        );
      }
    }

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: {
        ticketId: ticketId
      },
      create: {
        ticketId: ticketId,
        diagnostico: descripcion,
        saludBateria: saludBateria,
        versionSO: versionSistema,
        fechaInicio: new Date()
      },
      update: {
        diagnostico: descripcion,
        saludBateria: saludBateria,
        versionSO: versionSistema
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

    // Obtener el ticket con su reparación
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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