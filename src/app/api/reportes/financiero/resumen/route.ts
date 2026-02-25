import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999); // Incluir todo el día

    // Obtener datos del período actual
    const [ventasProductos, pagosReparacion, comprasInsumos, countVentas, countPagosReparacion] = await Promise.all([
      // Ventas de productos
      prisma.ventas.aggregate({
        where: {
          created_at: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          },
          estado: 'COMPLETADA'
        },
        _sum: {
          total: true
        }
      }),

      // Pagos de servicios de reparación (pagos reales recibidos - solo ACTIVOS)
      prisma.pagos.aggregate({
        where: {
          created_at: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          },
          estado: 'ACTIVO' // Solo contar pagos activos, excluir cancelados/devueltos
        },
        _sum: {
          monto: true
        }
      }),

      // Compras de insumos - obtener todos los registros y calcular el total
      prisma.entradas_almacen.findMany({
        where: {
          fecha: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          }
        },
        select: {
          precio_compra: true,
          cantidad: true
        }
      }),

      // Conteo de ventas en el periodo (cada venta = 1 ticket/transacción)
      prisma.ventas.count({
        where: {
          created_at: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          },
          estado: 'COMPLETADA'
        }
      }),

      // Conteo de tickets de reparación únicos con pagos en el periodo
      prisma.tickets.count({
        where: {
          pagos: {
            some: {
              created_at: {
                gte: fechaInicioDate,
                lte: fechaFinDate
              },
              estado: 'ACTIVO'
            }
          }
        }
      })
    ]);

    // Calcular totales - manejar casos donde _sum puede ser null
    const ingresosVentasProductos = ventasProductos._sum?.total || 0;
    const ingresosServiciosReparacion = pagosReparacion._sum?.monto || 0;
    const egresosComprasInsumos = comprasInsumos.reduce((total, entrada) => 
      total + (entrada.precio_compra * entrada.cantidad), 0
    );

    const ingresosTotales = ingresosVentasProductos + ingresosServiciosReparacion;
    const egresosTotales = egresosComprasInsumos;
    const balance = ingresosTotales - egresosTotales;

    // Total de tickets/transacciones en el periodo (ventas + tickets de reparación con pagos)
    const totalTicketsEnPeriodo = countVentas + countPagosReparacion;
    const costoPromedioTicket = totalTicketsEnPeriodo > 0
      ? ingresosTotales / totalTicketsEnPeriodo
      : 0;

    // Obtener datos del mes anterior para comparativa
    const mesAnteriorInicio = new Date(fechaInicioDate);
    mesAnteriorInicio.setMonth(mesAnteriorInicio.getMonth() - 1);
    const mesAnteriorFin = new Date(fechaFinDate);
    mesAnteriorFin.setMonth(mesAnteriorFin.getMonth() - 1);

    const [ventasProductosAnterior, pagosReparacionAnterior, comprasInsumosAnterior] = await Promise.all([
      prisma.ventas.aggregate({
        where: {
          created_at: {
            gte: mesAnteriorInicio,
            lte: mesAnteriorFin
          },
          estado: 'COMPLETADA'
        },
        _sum: {
          total: true
        }
      }),

      prisma.pagos.aggregate({
        where: {
          created_at: {
            gte: mesAnteriorInicio,
            lte: mesAnteriorFin
          },
          estado: 'ACTIVO' // Solo contar pagos activos
        },
        _sum: {
          monto: true
        }
      }),

      prisma.entradas_almacen.findMany({
        where: {
          fecha: {
            gte: mesAnteriorInicio,
            lte: mesAnteriorFin
          }
        },
        select: {
          precio_compra: true,
          cantidad: true
        }
      })
    ]);

    const ingresosAnterior = (ventasProductosAnterior._sum?.total || 0) + (pagosReparacionAnterior._sum?.monto || 0);
    const egresosAnterior = comprasInsumosAnterior.reduce((total, entrada) => 
      total + (entrada.precio_compra * entrada.cantidad), 0
    );
    const balanceAnterior = ingresosAnterior - egresosAnterior;

    // Calcular porcentaje de cambio
    const porcentajeCambio = ingresosAnterior > 0 
      ? ((ingresosTotales - ingresosAnterior) / ingresosAnterior) * 100 
      : 0;

    const resumen = {
      ingresos: {
        ventasProductos: ingresosVentasProductos,
        serviciosReparacion: ingresosServiciosReparacion,
        total: ingresosTotales
      },
      egresos: {
        comprasInsumos: egresosComprasInsumos,
        total: egresosTotales
      },
      balance,
      totalTicketsEnPeriodo,
      costoPromedioTicket,
      comparativaMesAnterior: {
        ingresos: ingresosTotales - ingresosAnterior,
        egresos: egresosTotales - egresosAnterior,
        balance: balance - balanceAnterior,
        porcentajeCambio
      }
    };

    return NextResponse.json(resumen);
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    return NextResponse.json(
      { error: 'Error al obtener el resumen financiero' },
      { status: 500 }
    );
  }
} 