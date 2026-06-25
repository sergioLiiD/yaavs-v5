import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  eachCalendarDayMX,
  formatDateShortMX,
  parseDateRangeMX,
  zonedTimeToUtc,
} from '@/lib/datetime';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const dias = eachCalendarDayMX(fechaInicio, fechaFin);

    const datosPorDia = await Promise.all(
      dias.map(async (dia) => {
        const { fechaInicioDate: inicioDia, fechaFinDate: finDia } = parseDateRangeMX(dia, dia);

        const [ventasProductos, serviciosReparacion, comprasInsumos] = await Promise.all([
          prisma.ventas.aggregate({
            where: {
              created_at: {
                gte: inicioDia,
                lte: finDia,
              },
              estado: 'COMPLETADA',
            },
            _sum: {
              total: true,
            },
          }),

          prisma.presupuestos.aggregate({
            where: {
              created_at: {
                gte: inicioDia,
                lte: finDia,
              },
            },
            _sum: {
              total_final: true,
            },
          }),

          prisma.entradas_almacen.findMany({
            where: {
              fecha: {
                gte: inicioDia,
                lte: finDia,
              },
            },
            select: {
              precio_compra: true,
              cantidad: true,
            },
          }),
        ]);

        const ingresos = (ventasProductos._sum?.total || 0) + (serviciosReparacion._sum?.total_final || 0);
        const egresos = comprasInsumos.reduce(
          (total, entrada) => total + entrada.precio_compra * entrada.cantidad,
          0
        );
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
          backgroundColor: '#10B981',
          borderColor: '#10B981',
        },
        {
          label: 'Egresos',
          data: egresosData,
          backgroundColor: '#EF4444',
          borderColor: '#EF4444',
        },
        {
          label: 'Balance',
          data: balanceData,
          backgroundColor: '#FEBF19',
          borderColor: '#FEBF19',
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
