import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { entradasIdsEnRangoMX } from '@/lib/reportes/financiero-queries';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { fechaInicio, fechaFin } = await request.json();

    const entradaIds = await entradasIdsEnRangoMX(fechaInicio, fechaFin);

    const comprasInsumos =
      entradaIds.length === 0
        ? []
        : await prisma.entradas_almacen.findMany({
            where: { id: { in: entradaIds } },
            include: {
              proveedores: {
                select: { nombre: true },
              },
              productos: {
                select: { nombre: true },
              },
            },
            orderBy: { fecha: 'desc' },
          });

    const egresos = comprasInsumos.map((compra) => {
      const costoTotal = compra.precio_compra * compra.cantidad;

      return {
        id: compra.id,
        fecha: compra.fecha.toISOString(),
        proveedor: compra.proveedores?.nombre || 'Proveedor no especificado',
        monto: costoTotal,
        productos: [
          `${compra.cantidad}x ${compra.productos?.nombre || 'Producto'} - $${compra.precio_compra}`,
        ],
        notas: compra.notas || undefined,
      };
    });

    return NextResponse.json(egresos);
  } catch (error) {
    console.error('Error al obtener detalle de egresos:', error);
    return NextResponse.json(
      { error: 'Error al obtener el detalle de egresos' },
      { status: 500 }
    );
  }
}
