import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { obtenerReportePiezasUsadas } from '@/lib/reportes/piezas-usadas';
import { formatDateMX } from '@/lib/datetime';

export const dynamic = 'force-dynamic';

function formatCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'fechaInicio y fechaFin son requeridos' },
        { status: 400 }
      );
    }

    const reporte = await obtenerReportePiezasUsadas({ fechaInicio, fechaFin });

    const resumenGlobal = [
      ['REPORTE DE PIEZAS USADAS — TICKETS ENTREGADOS'],
      [`Período: ${fechaInicio} al ${fechaFin}`],
      [],
      ['RESUMEN GENERAL'],
      ['Tickets entregados con piezas', reporte.resumen.totalTickets],
      ['Piezas distintas utilizadas', reporte.resumen.totalPiezasDistintas],
      ['Cantidad total de piezas', reporte.resumen.totalCantidadUsada],
      ['Total ingresos', formatCurrency(reporte.resumen.totalIngresos)],
      ['Total egresos (costo)', formatCurrency(reporte.resumen.totalEgresos)],
      ['Margen', formatCurrency(reporte.resumen.margen)],
      [],
      ['NOTA: La columna "Categoría (cliente)" está vacía para que la clasifiquen manualmente.'],
    ];

    const encabezadoPieza = [
      'SKU',
      'Producto',
      'Marca',
      'Modelo',
      'Categoría (cliente)',
      '# Tickets',
      'Cantidad usada',
      'Ingresos',
      'Egresos',
      'Margen',
    ];

    const filasPorPieza = reporte.porPieza.map((p) => [
      p.sku,
      p.nombre,
      p.marca ?? '',
      p.modelo ?? '',
      '',
      p.numTickets,
      p.cantidadUsada,
      formatCurrency(p.ingresos),
      formatCurrency(p.egresos),
      formatCurrency(p.margen),
    ]);

    const filasPorMes: (string | number)[][] = [
      ['RESUMEN POR MES Y PIEZA'],
      [],
      [
        'Mes',
        'SKU',
        'Producto',
        'Marca',
        'Modelo',
        'Categoría (cliente)',
        '# Tickets',
        'Cantidad usada',
        'Ingresos',
        'Egresos',
        'Margen',
      ],
    ];

    for (const mes of reporte.porMes) {
      for (const p of mes.piezas) {
        filasPorMes.push([
          mes.mesLabel,
          p.sku,
          p.nombre,
          p.marca ?? '',
          p.modelo ?? '',
          '',
          p.numTickets,
          p.cantidadUsada,
          formatCurrency(p.ingresos),
          formatCurrency(p.egresos),
          formatCurrency(p.margen),
        ]);
      }
    }

    const filasDetalle: (string | number)[][] = [
      ['DETALLE POR TICKET'],
      [],
      [
        'Ticket',
        'Fecha entrega',
        'SKU',
        'Producto',
        'Marca',
        'Modelo',
        'Categoría (cliente)',
        'Cantidad',
        'Ingreso',
        'Egreso',
        'Margen',
      ],
    ];

    for (const d of reporte.detalle) {
      filasDetalle.push([
        d.numeroTicket,
        formatDateMX(d.fechaEntrega),
        d.sku,
        d.nombreProducto,
        d.marca ?? '',
        d.modelo ?? '',
        '',
        d.cantidad,
        formatCurrency(d.ingreso),
        formatCurrency(d.egreso),
        formatCurrency(d.margen),
      ]);
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([...resumenGlobal, [], encabezadoPieza, ...filasPorPieza]),
      'Resumen por pieza'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(filasPorMes),
      'Por mes'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(filasDetalle),
      'Detalle tickets'
    );

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte-piezas-usadas-${fechaInicio}-${fechaFin}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error al exportar reporte de piezas usadas:', error);
    return NextResponse.json(
      { error: 'Error al exportar el reporte' },
      { status: 500 }
    );
  }
}
