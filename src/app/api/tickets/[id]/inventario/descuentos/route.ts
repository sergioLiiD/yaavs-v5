import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { obtenerResumenDescuentos } from '@/lib/inventory-utils';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);

    // Verificar que el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Obtener resumen de descuentos
    const descuentos = await obtenerResumenDescuentos(ticketId);

    return NextResponse.json({
      ticketId,
      descuentos,
      totalProductos: descuentos.length,
      totalCantidad: descuentos.reduce((sum, item) => sum + item.cantidad, 0)
    });

  } catch (error) {
    console.error('Error al obtener descuentos de inventario:', error);
    return NextResponse.json(
      { error: 'Error al obtener descuentos de inventario' },
      { status: 500 }
    );
  }
} 