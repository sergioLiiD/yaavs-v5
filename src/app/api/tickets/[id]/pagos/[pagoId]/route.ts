import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string; pagoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Validar permisos: ADMINISTRADOR o TICKETS_EDIT
    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    
    if (userRole !== 'ADMINISTRADOR' && !userPermissions.includes('TICKETS_EDIT')) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar pagos' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const pagoId = parseInt(params.pagoId);
    const body = await request.json();
    const { monto, metodo, referencia } = body;

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Verificar que el pago existe y pertenece al ticket
    const pagoExistente = await prisma.pagos.findFirst({
      where: {
        id: pagoId,
        ticket_id: ticketId,
      },
    });

    if (!pagoExistente) {
      return new NextResponse('Pago no encontrado', { status: 404 });
    }

    // Actualizar el pago
    const pagoActualizado = await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        monto: parseFloat(monto),
        metodo: metodo,
        referencia: referencia || null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(pagoActualizado);
  } catch (error) {
    console.error('Error al actualizar el pago:', error);
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; pagoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Validar permisos: ADMINISTRADOR o TICKETS_EDIT
    const userRole = session.user.role;
    const userPermissions = session.user.permissions || [];
    
    if (userRole !== 'ADMINISTRADOR' && !userPermissions.includes('TICKETS_EDIT')) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar pagos' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    const pagoId = parseInt(params.pagoId);

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { presupuestos: true },
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Verificar que el pago existe y pertenece al ticket
    const pago = await prisma.pagos.findFirst({
      where: {
        id: pagoId,
        ticket_id: ticketId,
      },
    });

    if (!pago) {
      return new NextResponse('Pago no encontrado', { status: 404 });
    }

    // Usar una transacción para asegurar la integridad de los datos
    await prisma.$transaction(async (tx) => {
      // Eliminar el pago
      await tx.pagos.delete({
        where: { id: pagoId }
      });

      // Actualizar el presupuesto si existe
      if (ticket.presupuestos) {
        const totalPagos = await tx.pagos.aggregate({
          where: { ticket_id: ticketId },
          _sum: { monto: true }
        });

        const totalPagado = totalPagos._sum.monto || 0;

        await tx.presupuestos.update({
          where: { id: ticket.presupuestos.id },
          data: {
            saldo: ticket.presupuestos.total_final - totalPagado,
            pagado: totalPagado >= ticket.presupuestos.total_final,
            updated_at: new Date()
          }
        });

        // Si el saldo es 0, actualizar el estado del ticket a PAGADO
        if (totalPagado >= ticket.presupuestos.total_final) {
          await tx.tickets.update({
            where: { id: ticketId },
            data: {
              estatus_reparacion_id: 5, // ID del estado PAGADO
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