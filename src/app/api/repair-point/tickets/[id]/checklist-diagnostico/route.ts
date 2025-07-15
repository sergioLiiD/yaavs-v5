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
    console.log('🔍 POST checklist-diagnostico - Iniciando...');
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Session:', session);
    console.log('🔍 Session user:', session?.user);

    if (!session?.user) {
      console.log('❌ No hay sesión de usuario');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const { checklist } = await request.json() as { checklist: ChecklistItem[] };

    console.log('🔍 Ticket ID:', ticketId);
    console.log('🔍 Checklist recibido:', checklist);

    // Validar que el ticket exista y obtener la reparación
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        reparaciones: true
      }
    });

    console.log('🔍 Ticket encontrado:', ticket);

    if (!ticket) {
      console.log('❌ Ticket no encontrado');
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (!ticket.reparaciones) {
      console.log('❌ No existe reparación para este ticket');
      return NextResponse.json(
        { error: 'No existe una reparación para este ticket' },
        { status: 400 }
      );
    }

    // Validar que el usuario sea el técnico asignado o tenga permisos adecuados
    console.log('🔍 Validando permisos...');
    console.log('🔍 Ticket tecnico_asignado_id:', ticket.tecnico_asignado_id);
    console.log('🔍 Session user id:', session.user.id);
    
    if (ticket.tecnico_asignado_id !== session.user.id) {
      console.log('🔍 Usuario no es técnico asignado, verificando permisos del punto...');
      // En el punto de reparación, permitimos que cualquier usuario del punto pueda editar
      const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
        where: {
          usuario_id: session.user.id,
          punto_recoleccion_id: ticket.punto_recoleccion_id || undefined
        }
      });

      console.log('🔍 UserPoint encontrado:', userPoint);

      if (!userPoint) {
        console.log('❌ Usuario no tiene permisos en el punto');
        return NextResponse.json(
          { error: 'No tienes permiso para realizar esta acción' },
          { status: 403 }
        );
      }
    }

    // Crear o actualizar el checklist de diagnóstico
    const checklistDiagnostico = await prisma.checklist_diagnostico.upsert({
      where: {
        reparacion_id: ticket.reparaciones.id
      },
      create: {
        reparacion_id: ticket.reparaciones.id,
        updated_at: new Date()
      },
      update: {
        updated_at: new Date()
      }
    });

    // Eliminar respuestas existentes
    await prisma.checklist_respuesta_diagnostico.deleteMany({
      where: {
        checklist_diagnostico_id: checklistDiagnostico.id
      }
    });

    // Crear las nuevas respuestas
    const respuestas = await Promise.all(
      checklist.map(item =>
        prisma.checklist_respuesta_diagnostico.create({
          data: {
            checklist_diagnostico_id: checklistDiagnostico.id,
            checklist_item_id: item.itemId,
            respuesta: item.respuesta,
            observaciones: item.observacion || null,
            updated_at: new Date()
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      respuestas
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
    console.log('🔍 GET checklist-diagnostico - Iniciando...');
    console.log('🔍 URL:', request.url);
    console.log('🔍 Headers:', Object.fromEntries(request.headers.entries()));
    
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Session:', session);
    console.log('🔍 Session user:', session?.user);
    console.log('🔍 Session user permissions:', session?.user?.permissions);

    if (!session?.user) {
      console.log('❌ No hay sesión de usuario');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    console.log('🔍 Ticket ID:', ticketId);

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

    console.log('🔍 Ticket encontrado:', ticket);

    if (!ticket) {
      console.log('❌ Ticket no encontrado');
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Validar que el usuario sea el técnico asignado o tenga permisos adecuados
    console.log('🔍 Validando permisos...');
    console.log('🔍 Ticket tecnico_asignado_id:', ticket.tecnico_asignado_id);
    console.log('🔍 Session user id:', session.user.id);
    
    if (ticket.tecnico_asignado_id !== session.user.id) {
      console.log('🔍 Usuario no es técnico asignado, verificando permisos del punto...');
      // En el punto de reparación, permitimos que cualquier usuario del punto pueda editar
      const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
        where: {
          usuario_id: session.user.id,
          punto_recoleccion_id: ticket.punto_recoleccion_id || undefined
        }
      });

      console.log('🔍 UserPoint encontrado:', userPoint);

      if (!userPoint) {
        console.log('❌ Usuario no tiene permisos en el punto');
        return NextResponse.json(
          { error: 'No tienes permiso para realizar esta acción' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      checklist: ticket.reparaciones?.checklist_diagnostico?.checklist_respuesta_diagnostico || []
    });

  } catch (error) {
    console.error('Error al obtener el checklist de diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el checklist de diagnóstico' },
      { status: 500 }
    );
  }
} 