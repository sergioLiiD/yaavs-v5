import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validarStockReparacion, procesarDescuentoInventario } from '@/lib/inventory-utils';

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
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { observaciones, checklist, tiempoTranscurrido } = await request.json();

    console.log('📋 Datos recibidos:', { observaciones, checklist: checklist?.length, tiempoTranscurrido });

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

      // Procesar descuento de inventario
      console.log('🔄 Procesando descuento de inventario...');
      const descuentoInventario = await procesarDescuentoInventario(Number(id), Number(session.user.id));
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
    return NextResponse.json(
      { error: 'Error al completar la reparación' },
      { status: 500 }
    );
  }
} 