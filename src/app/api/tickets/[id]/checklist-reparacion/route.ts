import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface ChecklistItem {
  itemId: number;
  respuesta: boolean;
  observacion?: string;
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

    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        reparaciones: {
          include: {
            checklist_reparacion: {
              include: {
                checklist_respuesta_reparacion: {
                  include: {
                    checklist_items: true
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
      checklist: ticket.reparaciones?.checklist_reparacion?.checklist_respuesta_reparacion || []
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

    let reparacion = ticket.reparaciones;

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

    // Obtener o crear el checklist de reparación
    let checklistReparacion = await prisma.checklist_reparacion.findUnique({
      where: { reparacion_id: reparacion.id }
    });
    if (!checklistReparacion) {
      checklistReparacion = await prisma.checklist_reparacion.create({
        data: { 
          reparacion_id: reparacion.id,
          updated_at: new Date()
        }
      });
    }

    // Eliminar respuestas existentes
    await prisma.checklist_respuesta_reparacion.deleteMany({
      where: { checklist_reparacion_id: checklistReparacion.id }
    });

    // Crear las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item: ChecklistItem) => {
        return prisma.checklist_respuesta_reparacion.create({
          data: {
            checklist_reparacion_id: checklistReparacion.id,
            checklist_item_id: item.itemId,
            respuesta: !!item.respuesta,
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
    console.error('Error al guardar el checklist de reparación:', error);
    return NextResponse.json(
      { error: 'Error al guardar el checklist de reparación' },
      { status: 500 }
    );
  }
} 