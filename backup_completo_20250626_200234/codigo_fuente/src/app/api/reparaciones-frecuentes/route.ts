import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface PrecioVenta {
  precio_venta: number;
}

interface NuevaReparacion {
  id: number;
}

interface ReparacionFrecuente {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

interface ReparacionCompleta {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
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

export async function GET() {
  try {
    const reparaciones = await prisma.$queryRaw<ReparacionCompleta[]>`
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
      GROUP BY rf.id
    `;

    return NextResponse.json(reparaciones);
  } catch (error) {
    console.error('Error al obtener reparaciones frecuentes:', error);
    return NextResponse.json(
      { error: 'Error al obtener reparaciones frecuentes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, activo, pasos, productos } = body;

    // Validar datos requeridos
    if (!nombre || !productos || !pasos) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Crear la reparación frecuente con sus relaciones
    const nuevaReparacion = await prisma.$transaction(async (tx) => {
      // Crear la reparación frecuente
      const reparacion = await tx.$queryRaw<ReparacionFrecuente[]>`
        INSERT INTO reparaciones_frecuentes (nombre, descripcion, activo, updated_at)
        VALUES (${nombre}, ${descripcion || ''}, ${activo ?? true}, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      // Crear los pasos
      if (pasos.length > 0) {
        await tx.$queryRaw`
          INSERT INTO pasos_reparacion_frecuente (reparacion_frecuente_id, descripcion, orden, updated_at)
          SELECT 
            ${reparacion[0].id},
            unnest(${pasos.map((p: any) => p.descripcion)}::text[]),
            unnest(${pasos.map((p: any) => p.orden)}::int[]),
            CURRENT_TIMESTAMP
        `;
      }

      // Crear los productos
      if (productos.length > 0) {
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
            ${reparacion[0].id},
            unnest(${productos.map((p: any) => p.productoId)}::int[]),
            unnest(${productos.map((p: any) => p.cantidad)}::int[]),
            unnest(${productos.map((p: any) => p.precioVenta)}::float[]),
            unnest(${productos.map((p: any) => p.conceptoExtra || null)}::text[]),
            unnest(${productos.map((p: any) => p.precioConceptoExtra || null)}::float[]),
            CURRENT_TIMESTAMP
        `;
      }

      // Obtener la reparación completa con sus relaciones
      const reparacionCompleta = await tx.$queryRaw<ReparacionCompleta[]>`
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
        WHERE rf.id = ${reparacion[0].id}
        GROUP BY rf.id
      `;

      return reparacionCompleta[0];
    });

    return NextResponse.json(nuevaReparacion);
  } catch (error) {
    console.error('Error al crear reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al crear la reparación frecuente' },
      { status: 500 }
    );
  }
} 