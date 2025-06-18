import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';
import { prisma } from '@/lib/prisma';

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
    const session = await getServerSession(authOptionsRepairPoint);

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

    // Crear o actualizar el checklist de diagnóstico
    const checklistDiagnostico = await prisma.checklistDiagnostico.upsert({
      where: {
        reparacionId: ticket.reparacion.id
      },
      create: {
        reparacionId: ticket.reparacion.id
      },
      update: {}
    });

    // Eliminar respuestas existentes
    await prisma.checklistRespuestaDiagnostico.deleteMany({
      where: {
        checklistDiagnosticoId: checklistDiagnostico.id
      }
    });

    // Crear nuevas respuestas
    await Promise.all(
      checklist.map(item =>
        prisma.checklistRespuestaDiagnostico.create({
          data: {
            checklistDiagnosticoId: checklistDiagnostico.id,
            checklistItemId: item.itemId,
            respuesta: item.respuesta,
            observaciones: item.observacion
          }
        })
      )
    );

    // Obtener el checklist actualizado
    const checklistActualizado = await prisma.checklistDiagnostico.findUnique({
      where: { id: checklistDiagnostico.id },
      include: {
        respuestas: {
          include: {
            checklistItem: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      checklist: checklistActualizado?.respuestas || []
    });

  } catch (error) {
    console.error('Error al guardar el checklist:', error);
    return NextResponse.json(
      { error: 'Error al guardar el checklist' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptionsRepairPoint);

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
            checklistDiagnostico: {
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
      checklist: ticket.reparacion?.checklistDiagnostico?.respuestas || []
    });

  } catch (error) {
    console.error('Error al obtener el checklist:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist' },
      { status: 500 }
    );
  }
} 