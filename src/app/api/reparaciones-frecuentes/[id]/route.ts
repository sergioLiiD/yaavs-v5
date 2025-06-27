import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PrecioVenta {
  precio_venta: number;
}

interface ReparacionCompleta {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  productos_reparacion_frecuente: Array<{
    id: number;
    productoId: number;
    cantidad: number;
    precioVenta: number;
    conceptoExtra: string | null;
    precioConceptoExtra: number | null;
    productos: {
      id: number;
      nombre: string;
      precioPromedio: number;
    };
  }>;
  pasos_reparacion_frecuente: Array<{
    id: number;
    descripcion: string;
    orden: number;
  }>;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, descripcion, activo, pasos, productos } = body;
    const id = parseInt(params.id);

    // Obtener los precios de venta más recientes para cada producto
    const productosConPrecios = await Promise.all(
      productos?.map(async (producto: any) => {
        const precioVenta = await prisma.$queryRaw<PrecioVenta[]>`
          SELECT precio_venta 
          FROM precios_venta 
          WHERE producto_id = ${producto.productoId}
          ORDER BY created_at DESC 
          LIMIT 1
        `;
        
        return {
          ...producto,
          precioVenta: precioVenta[0]?.precio_venta || producto.precioVenta
        };
      }) || []
    );

    // Actualizar la reparación frecuente con sus relaciones
    await prisma.$transaction(async (tx) => {
      // Actualizar la reparación frecuente
      await tx.$queryRaw`
        UPDATE reparaciones_frecuentes
        SET 
          nombre = ${nombre},
          descripcion = ${descripcion},
          activo = ${activo},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      // Eliminar los pasos existentes
      await tx.$queryRaw`
        DELETE FROM pasos_reparacion_frecuente
        WHERE reparacion_frecuente_id = ${id}
      `;

      // Insertar los nuevos pasos
      if (pasos?.length > 0) {
        await tx.$queryRaw`
          INSERT INTO pasos_reparacion_frecuente (reparacion_frecuente_id, descripcion, orden, updated_at)
          SELECT 
            ${id},
            unnest(${pasos.map((p: any) => p.descripcion)}::text[]),
            unnest(${pasos.map((p: any) => p.orden)}::int[]),
            CURRENT_TIMESTAMP
        `;
      }

      // Eliminar los productos existentes
      await tx.$queryRaw`
        DELETE FROM productos_reparacion_frecuente
        WHERE reparacion_frecuente_id = ${id}
      `;

      // Insertar los nuevos productos
      if (productosConPrecios.length > 0) {
        await tx.$queryRaw`
          INSERT INTO productos_reparacion_frecuente (
            reparacion_frecuente_id,
            producto_id,
            cantidad,
            precio_venta,
            concepto_extra,
            precio_concepto_extra,
            updated_at
          )
          SELECT 
            ${id},
            unnest(${productosConPrecios.map((p: any) => p.productoId)}::int[]),
            unnest(${productosConPrecios.map((p: any) => p.cantidad)}::int[]),
            unnest(${productosConPrecios.map((p: any) => p.precioVenta)}::float[]),
            unnest(${productosConPrecios.map((p: any) => p.conceptoExtra || null)}::text[]),
            unnest(${productosConPrecios.map((p: any) => p.precioConceptoExtra || null)}::float[]),
            CURRENT_TIMESTAMP
        `;
      }
    });

    // Obtener la reparación actualizada con sus relaciones
    const reparacionActualizada = await prisma.$queryRaw<ReparacionCompleta[]>`
      SELECT 
        rf.*,
        json_agg(
          json_build_object(
            'id', prf.id,
            'productoId', prf.producto_id,
            'cantidad', prf.cantidad,
            'precioVenta', COALESCE(
              (SELECT pv.precio_venta 
               FROM precios_venta pv 
               WHERE pv.producto_id = prf.producto_id 
               ORDER BY pv.created_at DESC 
               LIMIT 1),
              prf.precio_venta
            ),
            'conceptoExtra', prf.concepto_extra,
            'precioConceptoExtra', prf.precio_concepto_extra,
            'productos', json_build_object(
              'id', p.id,
              'nombre', p.nombre,
              'precioPromedio', p.precio_promedio
            )
          )
        ) as productos_reparacion_frecuente,
        json_agg(
          json_build_object(
            'id', prf2.id,
            'descripcion', prf2.descripcion,
            'orden', prf2.orden
          )
        ) as pasos_reparacion_frecuente
      FROM reparaciones_frecuentes rf
      LEFT JOIN productos_reparacion_frecuente prf ON prf.reparacion_frecuente_id = rf.id
      LEFT JOIN productos p ON p.id = prf.producto_id
      LEFT JOIN pasos_reparacion_frecuente prf2 ON prf2.reparacion_frecuente_id = rf.id
      WHERE rf.id = ${id}
      GROUP BY rf.id
    `;

    return NextResponse.json(reparacionActualizada[0]);
  } catch (error) {
    console.error('Error al actualizar reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reparación frecuente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.reparaciones_frecuentes.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Reparación frecuente eliminada' });
  } catch (error) {
    console.error('Error al eliminar reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reparación frecuente' },
      { status: 500 }
    );
  }
} 