import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validarStockReparacion, procesarDescuentoInventario, convertirConceptosAPiezas } from '@/lib/inventory-utils';
import {
  assertWorkflowAllowed,
  handleWorkflowError,
  loadTicketWorkflowContext,
} from '@/lib/ticket-workflow';

export const dynamic = 'force-dynamic';

interface CompletarReparacionPayload {
  observaciones: string;
  checklist: Array<{
    id: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 Iniciando endpoint de completar reparación...');
    console.log('📋 Ticket ID:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Obtener el ticket para verificar si el usuario es el técnico asignado
    const ticketCheck = await prisma.tickets.findUnique({
      where: { id: Number(id) },
      select: { tecnico_asignado_id: true }
    });

    if (!ticketCheck) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Validar permisos: ADMINISTRADOR, REPAIRS_EDIT, o ser el técnico asignado
    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    const isAssignedTechnician = ticketCheck.tecnico_asignado_id === session.user.id;
    
    if (userRole !== 'ADMINISTRADOR' && 
        !userPermissions.includes('REPAIRS_EDIT') && 
        !isAssignedTechnician) {
      return NextResponse.json(
        { error: 'No tienes permisos para completar reparaciones' },
        { status: 403 }
      );
    }

    const { observaciones, checklist, tiempoTranscurrido, razonExcepcion } = await request.json();

    console.log('📋 Datos recibidos:', { observaciones, checklist: checklist?.length, tiempoTranscurrido });

    const ticketWorkflow = await loadTicketWorkflowContext(Number(id));
    if (!ticketWorkflow) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    try {
      await assertWorkflowAllowed({
        ticket: ticketWorkflow,
        action: 'REPARACION',
        userRole: session.user.role,
        usuarioId: session.user.id,
        razonExcepcion,
      });
    } catch (error) {
      const handled = handleWorkflowError(error);
      if (handled) {
        return NextResponse.json(handled.body, { status: handled.status });
      }
      throw error;
    }

    // Validar stock antes de completar la reparación
    console.log('🔍 Validando stock para ticket:', id);
    const validacionStock = await validarStockReparacion(Number(id));
    
    if (!validacionStock.success) {
      console.log('❌ Validación de stock falló:', validacionStock.errors);
      return NextResponse.json(
        { 
          error: 'No se puede completar la reparación por falta de stock',
          detalles: validacionStock.errors,
          stockFaltante: validacionStock.missingStock
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación de stock exitosa');

    // Procesar todo en una transacción
    console.log('🔄 Iniciando transacción para completar reparación...');
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear o actualizar la reparación
      console.log('📝 Creando/actualizando reparación...');
      const reparacion = await tx.reparaciones.upsert({
        where: { ticket_id: Number(id) },
        create: {
          ticket_id: Number(id),
          observaciones,
          fecha_inicio: new Date(),
          fecha_fin: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        },
        update: {
          fecha_fin: new Date(),
          observaciones,
          updated_at: new Date()
        }
      });
      console.log('✅ Reparación creada/actualizada:', reparacion.id);

      // Buscar el estado "Reparado"
      console.log('🔍 Buscando estado "Reparado"...');
      const estatusReparado = await tx.estatus_reparacion.findFirst({
        where: { nombre: 'Reparado' }
      });

      if (!estatusReparado) {
        throw new Error('No se encontró el estado "Reparado"');
      }
      console.log('✅ Estado "Reparado" encontrado:', estatusReparado.id);

      // Actualizar el ticket con el estado "Reparado"
      console.log('📝 Actualizando ticket a estado "Reparado"...');
      const ticket = await tx.tickets.update({
        where: { id: Number(id) },
        data: {
          estatus_reparacion_id: estatusReparado.id,
          fecha_fin_reparacion: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Ticket actualizado a estado "Reparado"');

      // Convertir conceptos del presupuesto a piezas de reparación
      console.log('🔄 Convirtiendo conceptos del presupuesto...');
      try {
        await convertirConceptosAPiezas(Number(id), reparacion.id, tx);
        console.log('✅ Conceptos convertidos exitosamente');
      } catch (error) {
        console.error('❌ Error al convertir conceptos:', error);
        // Si falla la conversión, no continuar con el descuento para evitar inconsistencias
        throw new Error(`Error al convertir conceptos del presupuesto a piezas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // Procesar descuento de inventario
      console.log('🔄 Procesando descuento de inventario...');
      const descuentoInventario = await procesarDescuentoInventario(Number(id), Number(session.user.id), tx, reparacion.id);
      console.log('✅ Descuento de inventario procesado:', descuentoInventario);

      return {
        reparacion,
        ticket,
        descuentoInventario
      };
    });

    console.log('✅ Transacción completada exitosamente');

    return NextResponse.json({
      fechaFin: resultado.reparacion.fecha_fin,
      ticket: resultado.ticket,
      descuentoInventario: resultado.descuentoInventario
    });
  } catch (error) {
    console.error('❌ Error en la transacción:', error);
    
    // Detectar errores específicos y devolver mensajes más descriptivos
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Error al convertir conceptos a piezas
    if (errorMessage.includes('convertir conceptos') || errorMessage.includes('piezas registradas')) {
      return NextResponse.json(
        { 
          error: 'No se pueden procesar los productos del inventario',
          mensaje: 'No se encontraron piezas en el inventario para los productos del presupuesto. Por favor, verifica que los productos del presupuesto existan en el inventario y tengan el nombre correcto.',
          detalles: errorMessage
        },
        { status: 400 }
      );
    }
    
    // Error al procesar descuento de inventario
    if (errorMessage.includes('Stock insuficiente') || errorMessage.includes('stock')) {
      return NextResponse.json(
        { 
          error: 'Stock insuficiente',
          mensaje: 'No hay suficiente stock en el inventario para completar la reparación.',
          detalles: errorMessage
        },
        { status: 400 }
      );
    }
    
    // Error genérico
    return NextResponse.json(
      { 
        error: 'Error al completar la reparación',
        mensaje: errorMessage,
        detalles: errorMessage
      },
      { status: 500 }
    );
  }
} 