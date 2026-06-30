import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  pagosIdsReparacionEnRangoMX,
  ventasIdsEnRangoMX,
} from '@/lib/reportes/financiero-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const [ventaIds, pagoIds] = await Promise.all([
      ventasIdsEnRangoMX(fechaInicio, fechaFin),
      pagosIdsReparacionEnRangoMX(fechaInicio, fechaFin),
    ]);

    const [ventasProductos, pagosReparacion] = await Promise.all([
      ventaIds.length === 0
        ? []
        : prisma.ventas.findMany({
            where: { id: { in: ventaIds } },
            include: {
              clientes: {
                select: {
                  nombre: true,
                  apellido_paterno: true,
                  apellido_materno: true,
                },
              },
              detalle_ventas: {
                include: {
                  productos: {
                    select: { nombre: true },
                  },
                },
              },
            },
            orderBy: { created_at: 'desc' },
          }),
      pagoIds.length === 0
        ? []
        : prisma.pagos.findMany({
            where: { id: { in: pagoIds } },
            include: {
              tickets: {
                include: {
                  clientes: {
                    select: {
                      nombre: true,
                      apellido_paterno: true,
                      apellido_materno: true,
                    },
                  },
                },
              },
            },
            orderBy: { created_at: 'desc' },
          }),
    ]);

    const ingresosVentas = ventasProductos.map((venta) => {
      const nombreCliente =
        `${venta.clientes?.nombre || ''} ${venta.clientes?.apellido_paterno || ''} ${venta.clientes?.apellido_materno || ''}`.trim();
      const detalles =
        venta.detalle_ventas?.map(
          (detalle) =>
            `${detalle.cantidad}x ${detalle.productos?.nombre || 'Producto'} - $${detalle.precio_unitario}`
        ) || [];

      return {
        id: venta.id,
        fecha: venta.created_at.toISOString(),
        tipo: 'venta_producto' as const,
        cliente: nombreCliente || 'Cliente no especificado',
        monto: venta.total,
        metodoPago: 'Efectivo',
        referencia: `Venta #${venta.id}`,
        detalles,
      };
    });

    const ingresosServicios = pagosReparacion.map((pago) => {
      const nombreCliente =
        `${pago.tickets?.clientes?.nombre || ''} ${pago.tickets?.clientes?.apellido_paterno || ''} ${pago.tickets?.clientes?.apellido_materno || ''}`.trim();

      return {
        id: pago.id,
        fecha: pago.created_at.toISOString(),
        tipo: 'servicio_reparacion' as const,
        cliente: nombreCliente || 'Cliente no especificado',
        monto: pago.monto,
        metodoPago: pago.metodo,
        referencia: pago.referencia || `Pago #${pago.id}`,
        detalles: pago.tickets?.numero_ticket
          ? [`Ticket #${pago.tickets.numero_ticket}`]
          : [],
      };
    });

    const todosLosIngresos = [...ingresosVentas, ...ingresosServicios].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return NextResponse.json(todosLosIngresos);
  } catch (error) {
    console.error('Error al obtener detalle de ingresos:', error);
    return NextResponse.json(
      { error: 'Error al obtener el detalle de ingresos' },
      { status: 500 }
    );
  }
}
