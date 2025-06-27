import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; pagoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const pagoId = parseInt(params.pagoId);

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { presupuesto: true },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Verificar que el pago existe y pertenece al ticket
    const pago = await prisma.pago.findFirst({
      where: {
        id: pagoId,
        ticketId: ticketId,
      },
    });

    if (!pago) {
      return new NextResponse('Pago no encontrado', { status: 404 });
    }

    // Usar una transacción para asegurar la integridad de los datos
    await prisma.$transaction(async (tx) => {
      // Eliminar el pago
      await tx.$executeRaw`
        DELETE FROM "pagos"
        WHERE id = ${pagoId}
      `;

      // Actualizar el presupuesto
      if (ticket.presupuesto) {
        const totalPagos = await tx.$queryRaw<{ total: number }[]>`
          SELECT COALESCE(SUM(monto), 0) as total
          FROM "pagos"
          WHERE "ticketId" = ${ticketId}
        `;

        await tx.$executeRaw`
          UPDATE "Presupuesto"
          SET 
            "anticipo" = ${totalPagos[0].total},
            "saldo" = "total" - ${totalPagos[0].total},
            "pagado" = ${totalPagos[0].total >= ticket.presupuesto.total},
            "fechaPago" = ${totalPagos[0].total >= ticket.presupuesto.total ? new Date() : null},
            "updatedAt" = NOW()
          WHERE id = ${ticket.presupuesto.id}
        `;

        // Si el saldo es 0, actualizar el estado del ticket a PAGADO
        if (totalPagos[0].total >= ticket.presupuesto.total) {
          await tx.ticket.update({
            where: { id: ticketId },
            data: {
              estatusReparacionId: 5, // ID del estado PAGADO
            },
          });
        }
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar el pago:', error);
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