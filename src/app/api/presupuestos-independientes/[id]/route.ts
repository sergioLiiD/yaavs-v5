import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PresupuestoIndependienteCompleto } from '@/types/presupuesto-independiente';

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

    const presupuesto = await prisma.$queryRaw<PresupuestoIndependienteCompleto[]>`
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
      WHERE pi.id = ${id}
      GROUP BY pi.id, u.id, u.nombre, u.apellido_paterno, u.apellido_materno
    `;

    if (!presupuesto || presupuesto.length === 0) {
      return NextResponse.json({ error: 'Presupuesto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(presupuesto[0]);
  } catch (error) {
    console.error('Error al obtener presupuesto independiente:', error);
    return NextResponse.json(
      { error: 'Error al obtener el presupuesto independiente' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
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

    // Actualizar el presupuesto independiente con sus productos
    const presupuestoActualizado = await prisma.$transaction(async (tx) => {
      // Actualizar el presupuesto independiente
      await tx.presupuestos_independientes.update({
        where: { id },
        data: {
          nombre,
          descripcion: descripcion || '',
          cliente_nombre: cliente_nombre || '',
          total,
          updated_at: new Date()
        }
      });

      // Eliminar productos existentes
      await tx.productos_presupuesto_independiente.deleteMany({
        where: { presupuesto_independiente_id: id }
      });

      // Crear los nuevos productos del presupuesto
      if (productos.length > 0) {
        await tx.productos_presupuesto_independiente.createMany({
          data: productos.map((producto: any) => ({
            presupuesto_independiente_id: id,
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

      // Obtener el presupuesto actualizado con sus relaciones
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
        WHERE pi.id = ${id}
        GROUP BY pi.id, u.id, u.nombre, u.apellido_paterno, u.apellido_materno
      `;

      return presupuestoCompleto[0];
    });

    return NextResponse.json(presupuestoActualizado);
  } catch (error) {
    console.error('Error al actualizar presupuesto independiente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el presupuesto independiente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Eliminar el presupuesto independiente (los productos se eliminan en cascada)
    await prisma.presupuestos_independientes.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Presupuesto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar presupuesto independiente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el presupuesto independiente' },
      { status: 500 }
    );
  }
}
