import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db';
import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const presupuestos = await prisma.$queryRaw<PresupuestoIndependienteCompleto[]>`
      SELECT 
        pi.*,
        json_build_object(
          'id', u.id,
          'nombre', u.nombre,
          'apellido_paterno', u.apellido_paterno,
          'apellido_materno', u.apellido_materno
        ) as usuarios,
        json_agg(
          json_build_object(
            'id', ppi.id,
            'presupuesto_independiente_id', ppi.presupuesto_independiente_id,
            'producto_id', ppi.producto_id,
            'cantidad', ppi.cantidad,
            'precio_venta', ppi.precio_venta,
            'concepto_extra', ppi.concepto_extra,
            'precio_concepto_extra', ppi.precio_concepto_extra,
            'created_at', ppi.created_at,
            'updated_at', ppi.updated_at,
            'productos', CASE 
              WHEN ppi.producto_id IS NOT NULL THEN json_build_object(
                'id', p.id,
                'nombre', p.nombre,
                'precio_promedio', p.precio_promedio,
                'tipo', p.tipo,
                'sku', p.sku,
                'stock', p.stock,
                'marca', json_build_object('nombre', m.nombre),
                'modelo', json_build_object('nombre', mo.nombre)
              )
              ELSE NULL
            END
          )
        ) as productos_presupuesto_independiente
      FROM presupuestos_independientes pi
      LEFT JOIN usuarios u ON u.id = pi.usuario_id
      LEFT JOIN productos_presupuesto_independiente ppi ON ppi.presupuesto_independiente_id = pi.id
      LEFT JOIN productos p ON p.id = ppi.producto_id
      LEFT JOIN marcas m ON m.id = p.marca_id
      LEFT JOIN modelos mo ON mo.id = p.modelo_id
      GROUP BY pi.id, u.id, u.nombre, u.apellido_paterno, u.apellido_materno
      ORDER BY pi.created_at DESC
    `;

    return NextResponse.json(presupuestos);
  } catch (error) {
    console.error('Error al obtener presupuestos independientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener presupuestos independientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, descripcion, cliente_nombre, productos } = body;

    // Validar datos requeridos
    if (!nombre || !productos || !Array.isArray(productos)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Calcular total
    const total = productos.reduce((sum: number, producto: any) => {
      const subtotal = producto.precioVenta * producto.cantidad;
      const extra = producto.precioConceptoExtra || 0;
      return sum + subtotal + extra;
    }, 0);

    // Crear el presupuesto independiente con sus productos
    const nuevoPresupuesto = await prisma.$transaction(async (tx) => {
      // Crear el presupuesto independiente
      const presupuesto = await tx.presupuestos_independientes.create({
        data: {
          nombre,
          descripcion: descripcion || '',
          cliente_nombre: cliente_nombre || '',
          usuario_id: session.user.id,
          total,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Crear los productos del presupuesto
      if (productos.length > 0) {
        await tx.productos_presupuesto_independiente.createMany({
          data: productos.map((producto: any) => ({
            presupuesto_independiente_id: presupuesto.id,
            producto_id: producto.productoId,
            cantidad: producto.cantidad,
            precio_venta: producto.precioVenta,
            concepto_extra: producto.conceptoExtra || null,
            precio_concepto_extra: producto.precioConceptoExtra || null,
            created_at: new Date(),
            updated_at: new Date()
          }))
        });
      }

      // Obtener el presupuesto completo con sus relaciones
      const presupuestoCompleto = await tx.$queryRaw<PresupuestoIndependienteCompleto[]>`
        SELECT 
          pi.*,
          json_build_object(
            'id', u.id,
            'nombre', u.nombre,
            'apellido_paterno', u.apellido_paterno,
            'apellido_materno', u.apellido_materno
          ) as usuarios,
          json_agg(
            json_build_object(
              'id', ppi.id,
              'presupuesto_independiente_id', ppi.presupuesto_independiente_id,
              'producto_id', ppi.producto_id,
              'cantidad', ppi.cantidad,
              'precio_venta', ppi.precio_venta,
              'concepto_extra', ppi.concepto_extra,
              'precio_concepto_extra', ppi.precio_concepto_extra,
              'created_at', ppi.created_at,
              'updated_at', ppi.updated_at,
              'productos', CASE 
                WHEN ppi.producto_id IS NOT NULL THEN json_build_object(
                  'id', p.id,
                  'nombre', p.nombre,
                  'precio_promedio', p.precio_promedio,
                  'tipo', p.tipo,
                  'sku', p.sku,
                  'stock', p.stock,
                  'marca', json_build_object('nombre', m.nombre),
                  'modelo', json_build_object('nombre', mo.nombre)
                )
                ELSE NULL
              END
            )
          ) as productos_presupuesto_independiente
        FROM presupuestos_independientes pi
        LEFT JOIN usuarios u ON u.id = pi.usuario_id
        LEFT JOIN productos_presupuesto_independiente ppi ON ppi.presupuesto_independiente_id = pi.id
        LEFT JOIN productos p ON p.id = ppi.producto_id
        LEFT JOIN marcas m ON m.id = p.marca_id
        LEFT JOIN modelos mo ON mo.id = p.modelo_id
        WHERE pi.id = ${presupuesto.id}
        GROUP BY pi.id, u.id, u.nombre, u.apellido_paterno, u.apellido_materno
      `;

      return presupuestoCompleto[0];
    });

    return NextResponse.json(nuevoPresupuesto);
  } catch (error) {
    console.error('Error al crear presupuesto independiente:', error);
    return NextResponse.json(
      { error: 'Error al crear el presupuesto independiente' },
      { status: 500 }
    );
  }
}
