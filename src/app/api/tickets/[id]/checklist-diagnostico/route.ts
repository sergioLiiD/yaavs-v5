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

    console.log('🔍 POST /checklist-diagnostico - Datos recibidos del frontend:', checklist);
    console.log('🔍 POST /checklist-diagnostico - Tipo de datos:', typeof checklist);
    console.log('🔍 POST /checklist-diagnostico - Longitud:', checklist?.length);
    
    if (checklist && checklist.length > 0) {
      console.log('🔍 POST /checklist-diagnostico - Primer item:', checklist[0]);
      console.log('🔍 POST /checklist-diagnostico - Respuestas recibidas:');
      checklist.forEach((item, index) => {
        console.log(`  Item ${index + 1}: ID=${item.itemId}, Respuesta=${item.respuesta} (tipo: ${typeof item.respuesta}), Observación="${item.observacion}"`);
      });
    }

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

    // Actualizar el estado del ticket a "En Diagnóstico"
    await prisma.tickets.update({
      where: { id: ticketId },
      data: {
        estatus_reparacion_id: 29, // "En Diagnóstico"
        fecha_inicio_diagnostico: new Date(),
        updated_at: new Date()
      }
    });

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

    // Obtener el ticket con su reparación y checklist
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        reparaciones: {
          include: {
            checklist_diagnostico: {
              include: {
                checklist_respuesta_diagnostico: {
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

    // Obtener la reparación
    const reparacion = Array.isArray(ticket.reparaciones) ? ticket.reparaciones[0] : ticket.reparaciones;

    console.log('🔍 Reparación encontrada:', reparacion);

    if (!reparacion || !reparacion.checklist_diagnostico) {
      console.log('🔍 No hay checklist de diagnóstico, devolviendo array vacío');
      return NextResponse.json({
        success: true,
        checklist: []
      });
    }

    console.log('🔍 Checklist de diagnóstico encontrado:', reparacion.checklist_diagnostico);
    console.log('🔍 Respuestas del checklist:', reparacion.checklist_diagnostico.checklist_respuesta_diagnostico);

    // Formatear las respuestas del checklist
    const checklist = reparacion.checklist_diagnostico.checklist_respuesta_diagnostico.map((respuesta: any) => ({
      itemId: respuesta.checklist_items.id,
      item: respuesta.checklist_items.nombre,
      respuesta: respuesta.respuesta,
      observacion: respuesta.observaciones || ''
    }));

    console.log('🔍 Checklist formateado para devolver:', checklist);

    return NextResponse.json({
      success: true,
      checklist
    });

  } catch (error) {
    console.error('Error al obtener el checklist de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de diagnóstico' },
      { status: 500 }
    );
  }
} 