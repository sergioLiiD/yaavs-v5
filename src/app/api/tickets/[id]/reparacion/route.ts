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
        fechaFin: completar ? new Date() : undefined,
        diagnostico: body.diagnostico,
        saludBateria: body.saludBateria,
        versionSO: body.versionSO
      },
      create: {
        ticketId,
        observaciones,
        fechaInicio: new Date(),
        fechaFin: completar ? new Date() : undefined,
        diagnostico: body.diagnostico,
        saludBateria: body.saludBateria,
        versionSO: body.versionSO
      }
    });

    console.log('Reparación actualizada:', reparacion);

    // Guardar las respuestas del checklist
    if (checklist && Array.isArray(checklist)) {
      // Usar el endpoint de checklist para guardar las respuestas
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const checklistResponse = await fetch(`${baseUrl}/api/tickets/${ticketId}/checklist-reparacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || ''
        },
        body: JSON.stringify({ checklist })
      });

      if (!checklistResponse.ok) {
        const errorData = await checklistResponse.json();
        console.error('Error al guardar el checklist:', errorData);
        throw new Error('Error al guardar el checklist');
      }

      console.log('Checklist guardado:', checklist);
    }

    // Actualizar el estado del ticket si es necesario
    if (completar) {
      const estatusReparado = await prisma.estatusReparacion.findFirst({
        where: { nombre: 'Reparado' }
      });

      if (!estatusReparado) {
        throw new Error('No se encontró el estatus "Reparado"');
      }

      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          estatusReparacionId: estatusReparado.id,
          fechaFinReparacion: new Date()
        }
      });

      console.log('Estatus del ticket actualizado a: Reparado');
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