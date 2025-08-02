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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { observaciones, checklist, tiempoTranscurrido } = await request.json();

    // Validar stock antes de completar la reparación
    const validacionStock = await validarStockReparacion(Number(id));
    
    if (!validacionStock.success) {
      return NextResponse.json(
        { 
          error: 'No se puede completar la reparación por falta de stock',
          detalles: validacionStock.errors,
          stockFaltante: validacionStock.missingStock
        },
        { status: 400 }
      );
    }

    // Procesar todo en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear o actualizar la reparación
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

      // Buscar el estado "Reparado"
      const estatusReparado = await tx.estatus_reparacion.findFirst({
        where: { nombre: 'Reparado' }
      });

      if (!estatusReparado) {
        throw new Error('No se encontró el estado "Reparado"');
      }

      // Actualizar el ticket con el estado "Reparado"
      const ticket = await tx.tickets.update({
        where: { id: Number(id) },
        data: {
          estatus_reparacion_id: estatusReparado.id,
          fecha_fin_reparacion: new Date(),
          updated_at: new Date()
        }
      });

      // Procesar descuento de inventario
      const descuentoInventario = await procesarDescuentoInventario(Number(id), Number(session.user.id));

      return {
        reparacion,
        ticket,
        descuentoInventario
      };
    });

    return NextResponse.json({
      fechaFin: resultado.reparacion.fecha_fin,
      ticket: resultado.ticket,
      descuentoInventario: resultado.descuentoInventario
    });
  } catch (error) {
    console.error('Error al completar la reparación:', error);
    return NextResponse.json(
      { error: 'Error al completar la reparación' },
      { status: 500 }
    );
  }
} 