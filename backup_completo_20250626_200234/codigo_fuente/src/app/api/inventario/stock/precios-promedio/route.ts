import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface PrecioPromedio {
  productoId: number;
  _avg: {
    precioCompra: number | null;
  };
}

export async function GET() {
  try {
    // Obtener los precios promedio de compra por producto desde EntradaAlmacen
    const preciosPromedio = await prisma.entradaAlmacen.groupBy({
      by: ['productoId'],
      _avg: {
        precioCompra: true
      }
    });

    console.log('Precios promedio obtenidos:', preciosPromedio);

    // Transformar los datos al formato esperado
    const preciosFormateados = preciosPromedio.map((precio: PrecioPromedio) => ({
      producto_id: precio.productoId,
      precio_promedio: Number(precio._avg.precioCompra) || 0
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