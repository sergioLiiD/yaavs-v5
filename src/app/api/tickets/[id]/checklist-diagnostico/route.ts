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

    // Obtener o crear el checklist de diagnóstico
    const checklistDiagnostico = await prisma.checklistDiagnostico.upsert({
      where: { reparacionId: reparacion.id },
      update: {}, // No actualizar nada aquí
      create: {
        reparacionId: reparacion.id
      }
    });

    // Eliminar respuestas existentes
    await prisma.checklistRespuestaDiagnostico.deleteMany({
      where: { checklistDiagnosticoId: checklistDiagnostico.id }
    });

    // Crear las respuestas del checklist
    const respuestas = await Promise.all(
      checklist.map(async (item) => {
        return prisma.checklistRespuestaDiagnostico.create({
          data: {
            checklistDiagnosticoId: checklistDiagnostico.id,
            checklistItemId: item.itemId,
            respuesta: String(item.respuesta).toLowerCase() === 'yes',
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
    console.error('Error al obtener el checklist de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de diagnóstico' },
      { status: 500 }
    );
  }
} 