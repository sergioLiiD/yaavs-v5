import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface ChecklistItem {
  itemId: number;
  respuesta: boolean;
  observacion: string;
}

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
    const { checklist } = await request.json() as { checklist: ChecklistItem[] };

    console.log('Checklist recibido en el endpoint:', checklist);

    // Obtener el ticket con su reparación
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
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

    let reparacion = Array.isArray(ticket.reparaciones) ? ticket.reparaciones[0] : ticket.reparaciones;

    // Si no existe la reparación, crearla
    if (!reparacion) {
      reparacion = await prisma.reparaciones.create({
        data: {
          ticket_id: ticketId,
          fecha_inicio: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Obtener o crear el checklist de diagnóstico
    const checklistDiagnostico = await prisma.checklist_diagnostico.upsert({
      where: { reparacion_id: reparacion.id },
      update: {}, // No actualizar nada aquí
      create: {
        reparacion_id: reparacion.id,
        updated_at: new Date()
      }
    });

    // Eliminar respuestas existentes
    await prisma.checklist_respuesta_diagnostico.deleteMany({
      where: { checklist_diagnostico_id: checklistDiagnostico.id }
    });

    // Crear las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item) => {
        return prisma.checklist_respuesta_diagnostico.create({
          data: {
            checklist_diagnostico_id: checklistDiagnostico.id,
            checklist_item_id: item.itemId,
            respuesta: item.respuesta,
            observaciones: item.observacion || null,
            updated_at: new Date()
          }
        });
      })
    );

    return NextResponse.json({
      success: true,
      checklist: respuestas
    });

  } catch (error) {
    console.error('Error al guardar el checklist de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al guardar el checklist de diagnóstico' },
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

    // Obtener el ticket
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Por ahora, devolver un array vacío hasta que se configuren las relaciones de checklist
    return NextResponse.json({
      success: true,
      checklist: []
    });

  } catch (error) {
    console.error('Error al obtener el checklist de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de diagnóstico' },
      { status: 500 }
    );
  }
} 