import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Obtener ventas de productos
    const ventasProductos = await prisma.ventas.findMany({
      where: {
        created_at: {
          gte: fechaInicioDate,
          lte: fechaFinDate
        },
        estado: 'COMPLETADA'
      },
      include: {
        clientes: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true
          }
        },
        detalle_ventas: {
          include: {
            productos: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Obtener pagos de servicios de reparación (pagos reales recibidos)
    const pagosReparacion = await prisma.pagos.findMany({
      where: {
        created_at: {
          gte: fechaInicioDate,
          lte: fechaFinDate
        }
      },
      include: {
        tickets: {
          include: {
            clientes: {
              select: {
                nombre: true,
                apellido_paterno: true,
                apellido_materno: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transformar ventas de productos
    const ingresosVentas = ventasProductos.map(venta => {
      const nombreCliente = `${venta.clientes?.nombre || ''} ${venta.clientes?.apellido_paterno || ''} ${venta.clientes?.apellido_materno || ''}`.trim();
      const detalles = venta.detalle_ventas?.map(detalle => 
        `${detalle.cantidad}x ${detalle.productos?.nombre || 'Producto'} - $${detalle.precio_unitario}`
      ) || [];

      return {
        id: venta.id,
        fecha: venta.created_at.toISOString(),
        tipo: 'venta_producto' as const,
        cliente: nombreCliente || 'Cliente no especificado',
        monto: venta.total,
        metodoPago: 'Efectivo', // Por defecto, se puede expandir después
        referencia: `Venta #${venta.id}`,
        detalles
      };
    });

    // Transformar pagos de servicios de reparación
    const ingresosServicios = pagosReparacion.map(pago => {
      const nombreCliente = `${pago.tickets?.clientes?.nombre || ''} ${pago.tickets?.clientes?.apellido_paterno || ''} ${pago.tickets?.clientes?.apellido_materno || ''}`.trim();
      
      return {
        id: pago.id,
        fecha: pago.created_at.toISOString(),
        tipo: 'servicio_reparacion' as const,
        cliente: nombreCliente || 'Cliente no especificado',
        monto: pago.monto,
        metodoPago: pago.metodo,
        referencia: pago.referencia || `Pago #${pago.id}`,
        detalles: pago.tickets?.numero_ticket ? [`Ticket #${pago.tickets.numero_ticket}`] : []
      };
    });

    // Combinar y ordenar por fecha
    const todosLosIngresos = [...ingresosVentas, ...ingresosServicios].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
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