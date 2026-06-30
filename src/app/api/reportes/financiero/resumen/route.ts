import { NextRequest, NextResponse } from 'next/server';
import { shiftDateStringMonths } from '@/lib/datetime';
import {
  countTicketsConPagosMX,
  countVentasMX,
  sumComprasInsumosMX,
  sumPagosReparacionMX,
  sumVentasProductosMX,
} from '@/lib/reportes/financiero-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const [
      ingresosVentasProductos,
      ingresosServiciosReparacion,
      egresosComprasInsumos,
      countVentas,
      countPagosReparacion,
    ] = await Promise.all([
      sumVentasProductosMX(fechaInicio, fechaFin),
      sumPagosReparacionMX(fechaInicio, fechaFin),
      sumComprasInsumosMX(fechaInicio, fechaFin),
      countVentasMX(fechaInicio, fechaFin),
      countTicketsConPagosMX(fechaInicio, fechaFin),
    ]);

    const ingresosTotales = ingresosVentasProductos + ingresosServiciosReparacion;
    const egresosTotales = egresosComprasInsumos;
    const balance = ingresosTotales - egresosTotales;

    const totalTicketsEnPeriodo = countVentas + countPagosReparacion;
    const costoPromedioTicket =
      totalTicketsEnPeriodo > 0 ? ingresosTotales / totalTicketsEnPeriodo : 0;

    const mesAnteriorInicioStr = shiftDateStringMonths(fechaInicio, -1);
    const mesAnteriorFinStr = shiftDateStringMonths(fechaFin, -1);

    const [ingresosVentasAnterior, ingresosReparacionAnterior, egresosAnterior] =
      await Promise.all([
        sumVentasProductosMX(mesAnteriorInicioStr, mesAnteriorFinStr),
        sumPagosReparacionMX(mesAnteriorInicioStr, mesAnteriorFinStr),
        sumComprasInsumosMX(mesAnteriorInicioStr, mesAnteriorFinStr),
      ]);

    const ingresosAnterior = ingresosVentasAnterior + ingresosReparacionAnterior;
    const balanceAnterior = ingresosAnterior - egresosAnterior;

    const porcentajeCambio =
      ingresosAnterior > 0
        ? ((ingresosTotales - ingresosAnterior) / ingresosAnterior) * 100
        : 0;

    const resumen = {
      ingresos: {
        ventasProductos: ingresosVentasProductos,
        serviciosReparacion: ingresosServiciosReparacion,
        total: ingresosTotales,
      },
      egresos: {
        comprasInsumos: egresosComprasInsumos,
        total: egresosTotales,
      },
      balance,
      totalTicketsEnPeriodo,
      costoPromedioTicket,
      comparativaMesAnterior: {
        ingresos: ingresosTotales - ingresosAnterior,
        egresos: egresosTotales - egresosAnterior,
        balance: balance - balanceAnterior,
        porcentajeCambio,
      },
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
