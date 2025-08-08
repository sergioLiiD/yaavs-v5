import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);
    fechaFinDate.setHours(23, 59, 59, 999);

    // Generar fechas para el período
    const fechas = [];
    const currentDate = new Date(fechaInicioDate);
    
    while (currentDate <= fechaFinDate) {
      fechas.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Obtener datos por día
    const datosPorDia = await Promise.all(
      fechas.map(async (fecha) => {
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);

        const [ventasProductos, serviciosReparacion, comprasInsumos] = await Promise.all([
          // Ventas de productos
          prisma.ventas.aggregate({
            where: {
              created_at: {
                gte: inicioDia,
                lte: finDia
              },
              estado: 'COMPLETADA'
            },
            _sum: {
              total: true
            }
          }),

          // Servicios de reparación (presupuestos)
          prisma.presupuestos.aggregate({
            where: {
              created_at: {
                gte: inicioDia,
                lte: finDia
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
                gte: inicioDia,
                lte: finDia
              }
            },
            _sum: {
              costo_total: true
            }
          })
        ]);

        const ingresos = (ventasProductos._sum?.total || 0) + (serviciosReparacion._sum?.total_final || 0);
        const egresos = comprasInsumos._sum?.costo_total || 0;
        const balance = ingresos - egresos;

        return {
          fecha: fecha.toISOString().split('T')[0],
          ingresos,
          egresos,
          balance
        };
      })
    );

    // Preparar datos para el gráfico
    const labels = datosPorDia.map(d => {
      const fecha = new Date(d.fecha);
      return fecha.toLocaleDateString('es-MX', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const ingresosData = datosPorDia.map(d => d.ingresos);
    const egresosData = datosPorDia.map(d => d.egresos);
    const balanceData = datosPorDia.map(d => d.balance);

    const datosGrafico = {
      labels,
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosData,
          backgroundColor: '#10B981',
          borderColor: '#10B981'
        },
        {
          label: 'Egresos',
          data: egresosData,
          backgroundColor: '#EF4444',
          borderColor: '#EF4444'
        },
        {
          label: 'Balance',
          data: balanceData,
          backgroundColor: '#FEBF19',
          borderColor: '#FEBF19'
        }
      ]
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