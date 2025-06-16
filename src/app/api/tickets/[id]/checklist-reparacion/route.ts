import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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

    // Validar que el ticket exista y obtener la reparación
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

    if (!ticket.reparacion) {
      return NextResponse.json(
        { error: 'No existe una reparación para este ticket' },
        { status: 400 }
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

    // Eliminar respuestas existentes
    await prisma.$executeRaw`
      DELETE FROM checklist_respuestas_reparacion
      WHERE reparacion_id = ${ticket.reparacion.id}
    `;

    // Crear nuevas respuestas
    const respuestas = await Promise.all(
      checklist.map(item =>
        prisma.$executeRaw`
          INSERT INTO checklist_respuestas_reparacion (
            reparacion_id,
            checklist_item_id,
            respuesta,
            observaciones,
            created_at,
            updated_at
          ) VALUES (
            ${ticket.reparacion.id},
            ${item.itemId},
            ${item.respuesta ? 'yes' : 'no'},
            ${item.observacion || null},
            NOW(),
            NOW()
          )
          RETURNING *
        `
      )
    );

    return NextResponse.json({
      success: true,
      checklist: respuestas
    });

  } catch (error) {
    console.error('Error al guardar el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al guardar el checklist de reparación' },
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

    // Obtener el ticket con su reparación y checklist
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: {
          include: {
            respuestasChecklist: {
              include: {
                checklistItem: true
              }
            }
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
      checklist: ticket.reparacion?.respuestasChecklist || []
    });

  } catch (error) {
    console.error('Error al obtener el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de reparación' },
      { status: 500 }
    );
  }
} 