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

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const { diagnostico, saludBateria, versionSO } = await request.json();

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Verificar que el ticket exista y pertenezca al punto de reparación
    const ticket = await prisma.tickets.findFirst({
      where: {
        id: ticketId,
        punto_recoleccion_id: userPoint.punto_recoleccion_id
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Crear o actualizar la reparación
    const reparacion = await prisma.reparaciones.upsert({
      where: {
        ticket_id: ticketId
      },
      create: {
        ticket_id: ticketId,
        diagnostico: diagnostico,
        salud_bateria: saludBateria,
        version_so: versionSO,
        fecha_inicio: new Date(),
        updated_at: new Date()
      },
      update: {
        diagnostico: diagnostico,
        salud_bateria: saludBateria,
        version_so: versionSO,
        updated_at: new Date()
      }
    });

    // Actualizar el estado del ticket
    await prisma.tickets.update({
      where: {
        id: ticketId
      },
      data: {
        estatus_reparacion_id: 2, // En diagnóstico
        fecha_inicio_diagnostico: new Date(),
        updated_at: new Date()
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
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuario_id: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Obtener el ticket con su reparación
    const ticket = await prisma.tickets.findFirst({
      where: {
        id: ticketId,
        punto_recoleccion_id: userPoint.punto_recoleccion_id
      },
      include: {
        reparaciones: true
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
      reparacion: ticket.reparaciones
    });

  } catch (error) {
    console.error('Error al obtener el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el diagnóstico' },
      { status: 500 }
    );
  }
} 