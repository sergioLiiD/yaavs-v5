import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const precio = await prisma.$queryRaw`
      SELECT 
        pv.id,
        pv.tipo,
        pv.nombre,
        pv.marca,
        pv.modelo,
        pv.precio_compra_promedio as "precioCompraPromedio",
        pv.precio_venta as "precioVenta",
        pv.producto_id as "productoId",
        pv.servicio_id as "servicioId",
        pv.created_by as "createdBy",
        pv.updated_by as "updatedBy",
        pv.created_at as "createdAt",
        pv.updated_at as "updatedAt"
      FROM precios_venta pv
      WHERE pv.servicio_id = ${id}
      AND pv.tipo = 'SERVICIO'
      ORDER BY pv.updated_at DESC
      LIMIT 1
    `;

    if (!precio || (Array.isArray(precio) && precio.length === 0)) {
      return NextResponse.json({ error: 'Precio no encontrado' }, { status: 404 });
    }

    return NextResponse.json(Array.isArray(precio) ? precio[0] : precio);
  } catch (error) {
    console.error('Error al obtener precio:', error);
    return NextResponse.json(
      { error: 'Error al obtener el precio' },
      { status: 500 }
    );
  }
} 