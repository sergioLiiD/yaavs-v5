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
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { usuarios_tickets_tecnico_asignado_idTousuarios: true }
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
    const reparacion = await prisma.reparaciones.upsert({
      where: { ticket_id: ticketId },
      update: {
        observaciones,
        fecha_fin: completar ? new Date() : undefined,
        diagnostico: body.diagnostico,
        salud_bateria: body.saludBateria,
        version_so: body.versionSO,
        updated_at: new Date()
      },
      create: {
        ticket_id: ticketId,
        observaciones,
        fecha_inicio: new Date(),
        fecha_fin: completar ? new Date() : undefined,
        diagnostico: body.diagnostico,
        salud_bateria: body.saludBateria,
        version_so: body.versionSO,
        updated_at: new Date()
      }
    });

    console.log('Reparación actualizada:', reparacion);

    // Guardar las respuestas del checklist
    if (checklist && Array.isArray(checklist)) {
      try {
        // Usar el endpoint de checklist para guardar las respuestas
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:4001';
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
          // No lanzar error, solo logear para no fallar todo el proceso
        } else {
          console.log('Checklist guardado:', checklist);
        }
      } catch (error) {
        console.error('Error al guardar el checklist (no crítico):', error);
        // No lanzar error, solo logear para no fallar todo el proceso
      }
    }

    // Actualizar el estado del ticket si es necesario
    if (completar) {
      const estatusReparado = await prisma.estatus_reparacion.findFirst({
        where: { nombre: 'Reparado' }
      });

      if (!estatusReparado) {
        throw new Error('No se encontró el estatus "Reparado"');
      }

      await prisma.tickets.update({
        where: { id: ticketId },
        data: {
          estatus_reparacion_id: estatusReparado.id,
          fecha_fin_reparacion: new Date()
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