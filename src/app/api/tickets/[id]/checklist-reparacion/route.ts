import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ChecklistItem {
  itemId: number;
  respuesta: boolean;
  observacion: string;
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

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: {
          include: {
            checklistReparacion: {
              include: {
                respuestas: {
                  include: {
                    checklistItem: true
                  }
                }
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
      checklist: ticket.reparacion?.checklistReparacion?.respuestas || []
    });

  } catch (error) {
    console.error('Error al obtener el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de reparación' },
      { status: 500 }
    );
  }
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

    let reparacion = ticket.reparacion;

    // Si no existe la reparación, crearla
    if (!reparacion) {
      reparacion = await prisma.reparacion.create({
        data: {
          ticketId,
          fechaInicio: new Date()
        }
      });
    }

    // Obtener o crear el checklist de reparación
    const checklistReparacion = await prisma.$queryRaw`
      INSERT INTO checklist_reparacion (reparacion_id, created_at, updated_at)
      VALUES (${reparacion.id}, NOW(), NOW())
      ON CONFLICT (reparacion_id) DO NOTHING
      RETURNING *
    `;

    // Eliminar respuestas existentes
    await prisma.$executeRaw`
      DELETE FROM checklist_respuesta_reparacion
      WHERE checklist_reparacion_id = ${reparacion.id}
    `;

    // Crear las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item: ChecklistItem) => {
        return prisma.$queryRaw`
          INSERT INTO checklist_respuesta_reparacion (
            checklist_reparacion_id,
            checklist_item_id,
            respuesta,
            observaciones,
            created_at,
            updated_at
          )
          VALUES (
            ${reparacion.id},
            ${item.itemId},
            ${Boolean(item.respuesta)},
            ${item.observacion || null},
            NOW(),
            NOW()
          )
          RETURNING *
        `;
      })
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