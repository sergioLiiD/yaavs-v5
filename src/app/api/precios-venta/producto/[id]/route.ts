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
    if (isNaN(id) || id <= 0) {
      console.log('❌ ID inválido recibido:', params.id);
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    console.log('🔍 Buscando precio de venta para producto ID:', id);

    // Primero verificar que el producto existe
    const producto = await prisma.productos.findUnique({
      where: { id: id },
      select: { 
        id: true,
        nombre: true, 
        precio_promedio: true,
        tipo: true,
        stock: true
      }
    });

    if (!producto) {
      console.log('❌ Producto no encontrado con ID:', id);
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    console.log('✅ Producto encontrado:', {
      id: producto.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      precio_promedio: producto.precio_promedio,
      stock: producto.stock
    });

    // Buscar precio específico en precios_venta
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
      WHERE pv.producto_id = ${id}
      AND pv.tipo = 'PRODUCTO'
      ORDER BY pv.updated_at DESC
      LIMIT 1
    `;

    const precioArray = Array.isArray(precio) ? precio : [precio];
    
    if (precioArray.length > 0 && precioArray[0]) {
      console.log('✅ Precio de venta específico encontrado:', precioArray[0]);
      return NextResponse.json(precioArray[0]);
    }

    // Si no hay precio específico, usar el precio promedio del producto
    console.log('⚠️ No se encontró precio específico, usando precio promedio:', producto.precio_promedio);
    return NextResponse.json({
      id: null,
      tipo: 'PRODUCTO',
      nombre: producto.nombre,
      marca: '',
      modelo: '',
      precioCompraPromedio: producto.precio_promedio || 0,
      precioVenta: producto.precio_promedio || 0,
      productoId: id,
      servicioId: null,
      createdBy: 'system',
      updatedBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error al obtener precio:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Error al obtener el precio', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 