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
      include: { presupuesto: true },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    if (!ticket.presupuesto) {
      return new NextResponse('El ticket no tiene un presupuesto', { status: 400 });
    }

    const presupuestoId = ticket.presupuesto.id;
    console.log('Presupuesto actual:', ticket.presupuesto);

    // Verificar que el anticipo sea al menos el 50% del total
    const anticipoMinimo = data.total * 0.5;
    if (data.anticipo < anticipoMinimo) {
      return new NextResponse(
        JSON.stringify({
          error: 'El anticipo debe ser al menos el 50% del total',
          anticipoMinimo,
        }),
        { status: 400 }
      );
    }

    // Usar una transacción para asegurar la integridad de los datos
    const presupuestoActualizado = await prisma.$transaction(async (tx) => {
      // Registrar el pago en el historial
      await tx.$executeRaw`
        INSERT INTO "pagos" (
          "ticketId",
          "monto",
          "fecha",
          "concepto",
          "metodoPago",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${ticketId},
          ${data.anticipo},
          NOW(),
          ${`Anticipo - ${data.metodoPago}`},
          ${data.metodoPago}::text::"MetodoPago",
          NOW(),
          NOW()
        )
      `;

      // Actualizar el presupuesto
      await tx.$executeRaw`
        UPDATE "Presupuesto"
        SET 
          "total" = ${data.total},
          "anticipo" = ${data.anticipo},
          "saldo" = ${data.saldo},
          "cuponDescuento" = ${data.cuponDescuento},
          "descuento" = ${data.descuento},
          "metodoPago" = ${data.metodoPago}::text::"MetodoPago",
          "pagado" = ${data.saldo === 0},
          "fechaPago" = ${data.saldo === 0 ? new Date() : null},
          "updatedAt" = NOW()
        WHERE id = ${presupuestoId}
      `;

      // Si el saldo es 0, actualizar el estado del ticket a PAGADO
      if (data.saldo === 0) {
        await tx.ticket.update({
          where: { id: ticketId },
          data: {
            estatusReparacionId: 5, // ID del estado PAGADO
          },
        });
      }

      // Obtener el presupuesto actualizado
      const presupuesto = await tx.presupuesto.findUnique({
        where: { id: presupuestoId }
      });

      return presupuesto;
    });

    console.log('Presupuesto actualizado:', presupuestoActualizado);

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