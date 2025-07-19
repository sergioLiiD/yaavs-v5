import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
      // Si no hay precio específico, buscar en productos que tengan este tipo_servicio_id
      const producto = await prisma.productos.findFirst({
        where: { 
          tipo_servicio_id: id,
          tipo: 'SERVICIO'
        },
        select: { 
          nombre: true,
          precio_promedio: true,
          tipos_servicio: {
            select: { nombre: true }
          }
        }
      });
      
      if (producto) {
        return NextResponse.json({
          id: null,
          tipo: 'SERVICIO',
          nombre: producto.tipos_servicio?.nombre || producto.nombre,
          marca: '',
          modelo: '',
          precioCompraPromedio: producto.precio_promedio,
          precioVenta: producto.precio_promedio, // Usar el precio promedio del producto
          productoId: null,
          servicioId: id,
          createdBy: 'system',
          updatedBy: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
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