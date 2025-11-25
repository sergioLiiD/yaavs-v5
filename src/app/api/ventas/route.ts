import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Obtener todas las ventas
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ventas = await prisma.ventas.findMany({
      include: {
        clientes: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            email: true,
            telefono_celular: true
          }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true
          }
        },
        detalle_ventas: {
          include: {
            productos: {
              select: {
                id: true,
                nombre: true,
                sku: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva venta
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { cliente_id, usuario_id, total, productos, metodo_pago, referencia } = body;

    // Validaciones
    if (!cliente_id || !usuario_id || !total || !productos || !Array.isArray(productos)) {
      return NextResponse.json(
        { error: 'Datos incompletos o inválidos' },
        { status: 400 }
      );
    }

    // Validar método de pago
    if (!metodo_pago || !['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(metodo_pago)) {
      return NextResponse.json(
        { error: 'Método de pago es requerido y debe ser: EFECTIVO, TARJETA o TRANSFERENCIA' },
        { status: 400 }
      );
    }

    if (productos.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto' },
        { status: 400 }
      );
    }

    // Verificar stock para todos los productos
    for (const producto of productos) {
      const productoDB = await prisma.productos.findUnique({
        where: { id: producto.producto_id },
        select: { stock: true, nombre: true }
      });

      if (!productoDB) {
        return NextResponse.json(
          { error: `Producto con ID ${producto.producto_id} no encontrado` },
          { status: 400 }
        );
      }

      if (productoDB.stock < producto.cantidad) {
        return NextResponse.json(
          { 
            error: `Stock insuficiente para ${productoDB.nombre}. Disponible: ${productoDB.stock}, Solicitado: ${producto.cantidad}` 
          },
          { status: 400 }
        );
      }
    }

    // Crear venta en transacción
    const venta = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const nuevaVenta = await tx.ventas.create({
        data: {
          cliente_id,
          usuario_id,
          total,
          estado: 'COMPLETADA',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Crear detalles de venta y actualizar stock
      for (const producto of productos) {
        // Crear detalle de venta
        await tx.detalle_ventas.create({
          data: {
            venta_id: nuevaVenta.id,
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario,
            subtotal: producto.subtotal,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Actualizar stock del producto
        await tx.productos.update({
          where: { id: producto.producto_id },
          data: {
            stock: {
              decrement: producto.cantidad
            }
          }
        });

        // Registrar salida de almacén
        await tx.salidas_almacen.create({
          data: {
            producto_id: producto.producto_id,
            cantidad: producto.cantidad,
            razon: 'VENTA',
            tipo: 'VENTA',
            referencia: `Venta #${nuevaVenta.id}`,
            fecha: new Date(),
            usuario_id,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
      }

      // Crear registro de pago asociado a la venta
      await tx.pagos.create({
        data: {
          venta_id: nuevaVenta.id,
          monto: total,
          metodo: metodo_pago as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
          referencia: referencia || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return nuevaVenta;
    });

    // Obtener la venta completa con detalles y pago
    const ventaCompleta = await prisma.ventas.findUnique({
      where: { id: venta.id },
      include: {
        clientes: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            email: true,
            telefono_celular: true
          }
        },
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true
          }
        },
        detalle_ventas: {
          include: {
            productos: {
              select: {
                id: true,
                nombre: true,
                sku: true
              }
            }
          }
        },
        pagos: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      }
    });

    return NextResponse.json(ventaCompleta, { status: 201 });
  } catch (error) {
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 