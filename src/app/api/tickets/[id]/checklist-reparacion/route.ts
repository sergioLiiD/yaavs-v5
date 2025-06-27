import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    let checklistReparacion = await prisma.checklistReparacion.findUnique({
      where: { reparacionId: reparacion.id }
    });
    if (!checklistReparacion) {
      checklistReparacion = await prisma.checklistReparacion.create({
        data: { reparacionId: reparacion.id }
      });
    }

    // Eliminar respuestas existentes
    await prisma.checklistRespuestaReparacion.deleteMany({
      where: { checklistReparacionId: checklistReparacion.id }
    });

    // Crear las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item: ChecklistItem) => {
        return prisma.checklistRespuestaReparacion.create({
          data: {
            checklistReparacionId: checklistReparacion.id,
            checklistItemId: item.itemId,
            respuesta: !!item.respuesta,
            observaciones: item.observacion || null
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