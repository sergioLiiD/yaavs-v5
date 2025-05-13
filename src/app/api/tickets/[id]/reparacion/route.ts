import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando endpoint de actualización de reparación...');
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No hay sesión de usuario');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    const ticketId = parseInt(params.id);
    console.log('ID del ticket:', ticketId);

    if (isNaN(ticketId)) {
      console.log('ID de ticket inválido');
      return NextResponse.json({ error: 'ID de ticket inválido' }, { status: 400 });
    }

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { tecnicoAsignado: true }
    });

    if (!ticket) {
      console.log('Ticket no encontrado');
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    console.log('Ticket encontrado:', ticket);

    const body = await request.json();
    console.log('Datos recibidos:', body);
    const { observaciones, checklist, fotos, videos, completar } = body;

    // Actualizar o crear la reparación
    const reparacion = await prisma.reparacion.upsert({
      where: { ticketId },
      update: {
        observaciones,
        fotos: fotos || [],
        videos: videos || [],
        fechaFin: completar ? new Date() : undefined
      },
      create: {
        ticketId,
        tecnicoId: parseInt(session.user.id),
        observaciones,
        fotos: fotos || [],
        videos: videos || [],
        fechaInicio: new Date(),
        fechaFin: completar ? new Date() : undefined
      }
    });

    console.log('Reparación actualizada:', reparacion);

    // Actualizar el estatus del ticket si se completó la reparación
    if (completar) {
      const estatusCompletado = await prisma.estatusReparacion.findFirst({
        where: { nombre: 'Reparación Completada' }
      });

      if (estatusCompletado) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { estatusReparacionId: estatusCompletado.id }
        });
        console.log('Estatus del ticket actualizado a:', estatusCompletado.nombre);
      }
    }

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al actualizar la reparación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 