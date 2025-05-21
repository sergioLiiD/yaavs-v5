import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { MetodoPago } from '@prisma/client';

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
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { 
        presupuesto: true,
        pagos: true 
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.presupuesto) {
      return new NextResponse('El ticket no tiene un presupuesto', { status: 400 });
    }

    const presupuestoId = ticket.presupuesto.id;
    console.log('Presupuesto actual:', ticket.presupuesto);

    // Calcular el saldo correcto
    const saldoActual = data.total - data.anticipo;
    console.log('Saldo calculado:', saldoActual);

    // Usar una transacción para asegurar la integridad de los datos
    const presupuestoActualizado = await prisma.$transaction(async (tx) => {
      // Registrar el pago en el historial
      const pago = await tx.pago.create({
        data: {
          ticketId: ticketId,
          monto: data.anticipo,
          fecha: new Date(),
          metodoPago: data.metodoPago,
        }
      });

      console.log('Pago registrado:', pago);

      // Actualizar el presupuesto
      const presupuestoActualizado = await tx.presupuesto.update({
        where: { id: presupuestoId },
        data: {
          total: data.total,
          anticipo: data.anticipo,
          saldo: saldoActual,
          cuponDescuento: data.cuponDescuento,
          descuento: data.descuento,
          metodoPago: data.metodoPago as MetodoPago,
          pagado: saldoActual === 0,
          fechaPago: saldoActual === 0 ? new Date() : null,
        }
      });

      console.log('Presupuesto actualizado:', presupuestoActualizado);

      // Si el saldo es 0, actualizar el estado del ticket a PAGADO
      if (saldoActual === 0) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            estatusReparacionId: 5, // ID del estado PAGADO
          },
        });
      }

      return presupuestoActualizado;
    });

    console.log('Transacción completada. Presupuesto final:', presupuestoActualizado);

    return NextResponse.json(presupuestoActualizado);
  } catch (error) {
    console.error('Error al procesar el pago:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 