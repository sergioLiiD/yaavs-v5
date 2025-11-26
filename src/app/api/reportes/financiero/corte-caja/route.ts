import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Obtener todos los pagos del período (tanto de tickets como de ventas) - solo ACTIVOS
    const pagos = await prisma.pagos.findMany({
      where: {
        created_at: {
          gte: fechaInicioDate,
          lte: fechaFinDate
        },
        estado: 'ACTIVO' // Solo incluir pagos activos, excluir cancelados/devueltos
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
        },
        ventas: {
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
      orderBy: [
        {
          created_at: 'desc'
        },
        {
          metodo: 'asc'
        }
      ]
    });

    // Calcular totales por método de pago
    const totales = {
      efectivo: 0,
      transferencia: 0,
      tarjeta: 0,
      total: 0
    };

    const transacciones = pagos.map(pago => {
      // Determinar si es pago de ticket o de venta
      const esPagoTicket = pago.ticket_id !== null;
      const esPagoVenta = pago.venta_id !== null;

      // Obtener información del cliente
      let nombreCliente = 'Cliente no especificado';
      let numeroReferencia = 'N/A';
      let tipoTransaccion = '';

      if (esPagoTicket && pago.tickets?.clientes) {
        nombreCliente = `${pago.tickets.clientes.nombre} ${pago.tickets.clientes.apellido_paterno} ${pago.tickets.clientes.apellido_materno || ''}`.trim();
        numeroReferencia = pago.tickets.numero_ticket || 'N/A';
        tipoTransaccion = 'Ticket';
      } else if (esPagoVenta && pago.ventas?.clientes) {
        nombreCliente = `${pago.ventas.clientes.nombre} ${pago.ventas.clientes.apellido_paterno} ${pago.ventas.clientes.apellido_materno || ''}`.trim();
        numeroReferencia = `Venta #${pago.venta_id}`;
        tipoTransaccion = 'Venta';
      }

      // Sumar al total correspondiente
      switch (pago.metodo) {
        case 'EFECTIVO':
          totales.efectivo += pago.monto;
          break;
        case 'TRANSFERENCIA':
          totales.transferencia += pago.monto;
          break;
        case 'TARJETA':
          totales.tarjeta += pago.monto;
          break;
      }
      totales.total += pago.monto;

      return {
        id: pago.id,
        fecha: pago.created_at.toISOString(),
        cliente: nombreCliente,
        monto: pago.monto,
        metodo: pago.metodo,
        numeroTicket: numeroReferencia,
        tipoTransaccion,
        referencia: pago.referencia || null
      };
    });

    // Agrupar transacciones por método de pago para mejor presentación
    const transaccionesAgrupadas = {
      EFECTIVO: transacciones.filter(t => t.metodo === 'EFECTIVO'),
      TRANSFERENCIA: transacciones.filter(t => t.metodo === 'TRANSFERENCIA'),
      TARJETA: transacciones.filter(t => t.metodo === 'TARJETA')
    };

    return NextResponse.json({
      totales,
      transacciones,
      transaccionesAgrupadas,
      resumen: {
        totalTransacciones: transacciones.length,
        cantidadEfectivo: transaccionesAgrupadas.EFECTIVO.length,
        cantidadTransferencia: transaccionesAgrupadas.TRANSFERENCIA.length,
        cantidadTarjeta: transaccionesAgrupadas.TARJETA.length
      }
    });

  } catch (error) {
    console.error('Error al obtener corte de caja:', error);
    return NextResponse.json(
      { error: 'Error al obtener el corte de caja' },
      { status: 500 }
    );
  }
}

