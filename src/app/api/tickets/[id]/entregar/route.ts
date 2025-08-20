import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const { firma } = await request.json();

    // La firma ya no es requerida, se hará físicamente después de imprimir

    // Obtener el ticket con toda la información necesaria
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        estatus_reparacion: true,
        presupuestos: true,
        pagos: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }

    // Verificar que el ticket esté reparado
    if (ticket.estatus_reparacion?.nombre !== 'Reparado') {
      return NextResponse.json({ 
        message: 'El ticket debe estar en estado "Reparado" para poder entregarlo' 
      }, { status: 400 });
    }

    // Verificar que ya esté entregado
    if (ticket.entregado) {
      return NextResponse.json({ 
        message: 'El equipo ya fue entregado' 
      }, { status: 400 });
    }

    // Calcular saldo
    const totalPresupuesto = ticket.presupuestos?.total || 0;
    const totalPagos = ticket.pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const saldo = totalPresupuesto - totalPagos;

    // Verificar que el saldo sea 0
    if (saldo > 0) {
      return NextResponse.json({ 
        message: `El equipo no puede ser entregado. Saldo pendiente: $${saldo.toFixed(2)}` 
      }, { status: 400 });
    }

    // Obtener el usuario que está realizando la entrega
    const usuario = await prisma.usuarios.findUnique({
      where: { email: session.user.email }
    });

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar el ticket como entregado
    const ticketActualizado = await prisma.tickets.update({
      where: { id: ticketId },
      data: {
        entregado: true,
        fecha_entrega: new Date(),
        updated_at: new Date()
      },
      include: {
        clientes: true,
        modelos: {
          include: {
            marcas: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Equipo entregado exitosamente',
      ticket: ticketActualizado
    });

  } catch (error) {
    console.error('Error al entregar equipo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
