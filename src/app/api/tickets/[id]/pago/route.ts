import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MetodoPago } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const data = await request.json();

    console.log('Datos recibidos:', data);

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { 
        presupuestos: true,
        pagos: true,
        estatus_reparacion: true
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.presupuestos) {
      return new NextResponse('El ticket no tiene un presupuesto', { status: 400 });
    }

    const presupuestoId = ticket.presupuestos.id;
    console.log('Presupuesto actual:', ticket.presupuestos);

    // Calcular el total y el saldo
    const total = ticket.presupuestos.total;
    const saldoActual = total - data.anticipo;
    console.log('Total calculado:', total);
    console.log('Saldo calculado:', saldoActual);

    // Iniciar transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Registrar el pago
      const pago = await tx.pagos.create({
        data: {
          monto: data.anticipo,
          metodo: data.metodoPago as MetodoPago,
          ticket_id: ticketId,
          referencia: data.referencia || null,
          created_at: new Date(),
          updated_at: new Date()
        },
      });

      // Actualizar el presupuesto
      const presupuestoActualizado = await tx.presupuestos.update({
        where: { id: presupuestoId },
        data: {
          total_final: saldoActual,
          aprobado: saldoActual <= 0,
          saldo: Math.max(0, saldoActual),
          pagado: saldoActual <= 0,
          updated_at: new Date()
        },
      });

      // Determinar el nuevo estado del ticket
      let nuevoEstado;
      if (saldoActual <= 0) {
        // Si el saldo es 0, buscar el estado "Reparación Completada"
        nuevoEstado = await tx.estatus_reparacion.findFirst({
          where: { nombre: 'Reparación Completada' }
        });
      } else if (ticket.estatus_reparacion.nombre === 'Presupuesto Generado') {
        // Si hay saldo pendiente y estaba en "Presupuesto Generado", mover a "En Reparación"
        nuevoEstado = await tx.estatus_reparacion.findFirst({
          where: { nombre: 'En Reparación' }
        });
      }

      // Actualizar el estado del ticket si es necesario
      if (nuevoEstado) {
        await tx.tickets.update({
          where: { id: ticketId },
          data: {
            estatus_reparacion_id: nuevoEstado.id,
            updated_at: new Date()
          }
        });
      }

      return { pago, presupuestoActualizado };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return new NextResponse(
      `Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      { status: 500 }
    );
  }
} 