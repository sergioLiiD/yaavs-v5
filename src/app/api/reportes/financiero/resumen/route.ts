import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999); // Incluir todo el día

    // Obtener datos del período actual
    const [ventasProductos, serviciosReparacion, comprasInsumos] = await Promise.all([
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

      // Servicios de reparación (presupuestos con total_final)
      prisma.presupuestos.aggregate({
        where: {
          created_at: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          },
          total_final: {
            not: null
          }
        },
        _sum: {
          total_final: true
        }
      }),

      // Compras de insumos
      prisma.entradas_almacen.aggregate({
        where: {
          fecha_entrada: {
            gte: fechaInicioDate,
            lte: fechaFinDate
          }
        },
        _sum: {
          costo_total: true
        }
      })
    ]);

    // Calcular totales
    const ingresosVentasProductos = ventasProductos._sum.total || 0;
    const ingresosServiciosReparacion = serviciosReparacion._sum.total_final || 0;
    const egresosComprasInsumos = comprasInsumos._sum.costo_total || 0;

    const ingresosTotales = ingresosVentasProductos + ingresosServiciosReparacion;
    const egresosTotales = egresosComprasInsumos;
    const balance = ingresosTotales - egresosTotales;

    // Obtener datos del mes anterior para comparativa
    const mesAnteriorInicio = new Date(fechaInicioDate);
    mesAnteriorInicio.setMonth(mesAnteriorInicio.getMonth() - 1);
    const mesAnteriorFin = new Date(fechaFinDate);
    mesAnteriorFin.setMonth(mesAnteriorFin.getMonth() - 1);

    const [ventasProductosAnterior, serviciosReparacionAnterior, comprasInsumosAnterior] = await Promise.all([
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

      prisma.presupuestos.aggregate({
        where: {
          created_at: {
            gte: mesAnteriorInicio,
            lte: mesAnteriorFin
          },
          total_final: {
            not: null
          }
        },
        _sum: {
          total_final: true
        }
      }),

      prisma.entradas_almacen.aggregate({
        where: {
          fecha_entrada: {
            gte: mesAnteriorInicio,
            lte: mesAnteriorFin
          }
        },
        _sum: {
          costo_total: true
        }
      })
    ]);

    const ingresosAnterior = (ventasProductosAnterior._sum.total || 0) + (serviciosReparacionAnterior._sum.total_final || 0);
    const egresosAnterior = comprasInsumosAnterior._sum.costo_total || 0;
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