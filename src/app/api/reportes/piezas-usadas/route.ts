import { NextRequest, NextResponse } from 'next/server';
import { obtenerReportePiezasUsadas } from '@/lib/reportes/piezas-usadas';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json(reporte);
  } catch (error) {
    console.error('Error al obtener reporte de piezas usadas:', error);
    return NextResponse.json(
      { error: 'Error al obtener el reporte de piezas usadas' },
      { status: 500 }
    );
  }
}
