import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  eachCalendarDayMX,
  formatDateShortMX,
  zonedTimeToUtc,
} from '@/lib/datetime';
import {
  sumComprasInsumosMX,
  sumPagosReparacionMX,
  sumVentasProductosMX,
} from '@/lib/reportes/financiero-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const dias = eachCalendarDayMX(fechaInicio, fechaFin);

    const datosPorDia = await Promise.all(
      dias.map(async (dia) => {
        const [ingresosVentas, ingresosReparacion, egresos] = await Promise.all([
          sumVentasProductosMX(dia, dia),
          sumPagosReparacionMX(dia, dia),
          sumComprasInsumosMX(dia, dia),
        ]);

        const ingresos = ingresosVentas + ingresosReparacion;
        const balance = ingresos - egresos;

        return {
          fecha: dia,
          ingresos,
          egresos,
          balance,
        };
      })
    );

    const labels = datosPorDia.map((d) =>
      formatDateShortMX(zonedTimeToUtc(d.fecha, '12:00:00'))
    );

    const ingresosData = datosPorDia.map((d) => d.ingresos);
    const egresosData = datosPorDia.map((d) => d.egresos);
    const balanceData = datosPorDia.map((d) => d.balance);

    const datosGrafico = {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
        },
        {
          label: 'Egresos',
          data: egresosData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
        },
        {
          label: 'Balance',
          data: balanceData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
        },
      ],
    };

    return NextResponse.json(datosGrafico);
  } catch (error) {
    console.error('Error al obtener datos del gráfico:', error);
    return NextResponse.json(
      { error: 'Error al obtener los datos del gráfico' },
      { status: 500 }
    );
  }
}
