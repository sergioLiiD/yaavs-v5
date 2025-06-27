import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

interface PrecioPromedio {
  producto_id: number;
  _avg: {
    precio_compra: number | null;
  };
}

export async function GET() {
  try {
    // Obtener los precios promedio de compra por producto desde entradas_almacen
    const preciosPromedio = await prisma.entradas_almacen.groupBy({
      by: ['producto_id'],
      _avg: {
        precio_compra: true
      }
    });

    console.log('Precios promedio obtenidos:', preciosPromedio);

    // Transformar los datos al formato esperado
    const preciosFormateados = preciosPromedio.map((precio: PrecioPromedio) => ({
      producto_id: precio.producto_id,
      precio_promedio: Number(precio._avg.precio_compra) || 0
    }));

    console.log('Precios formateados:', preciosFormateados);

    return NextResponse.json(preciosFormateados);
  } catch (error) {
    console.error('Error detallado al obtener precios promedio:', error);
    return NextResponse.json(
      { error: 'Error al obtener los precios promedio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 