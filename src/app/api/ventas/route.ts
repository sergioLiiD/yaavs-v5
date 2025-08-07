import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clienteId, items, total } = body;

    if (!clienteId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Verificar stock para todos los productos
    for (const item of items) {
      const producto = await prisma.productos.findUnique({
        where: { id: item.productoId },
        select: { stock: true }
      });

      if (!producto || producto.stock < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para el producto ID: ${item.productoId}` },
          { status: 400 }
        );
      }
    }

    const venta = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const nuevaVenta = await tx.ventas.create({
        data: {
          cliente_id: clienteId,
          fecha: new Date(),
          total,
          estado: 'COMPLETADA',
          usuario_id: session.user.id
        }
      });

      // Crear los items de la venta y actualizar stock
      const itemsVenta = await Promise.all(
        items.map(async (item) => {
          const ventaItem = await tx.detalle_ventas.create({
            data: {
              venta_id: nuevaVenta.id,
              producto_id: item.productoId,
              cantidad: item.cantidad,
              precio_unitario: item.precioUnitario,
              subtotal: item.subtotal
            }
          });

          // Actualizar stock del producto
          await tx.productos.update({
            where: { id: item.productoId },
            data: {
              stock: {
                decrement: item.cantidad
              }
            }
          });

          // Registrar salida de almacén
          await tx.salidas_almacen.create({
            data: {
              producto_id: item.productoId,
              cantidad: item.cantidad,
              razon: `Venta #${nuevaVenta.id}`,
              tipo: 'VENTA',
              usuario_id: session.user.id,
              fecha: new Date()
            }
          });

          return ventaItem;
        })
      );

      return {
        ...nuevaVenta,
        items: itemsVenta
      };
    });

    return NextResponse.json(venta);
  } catch (error: any) {
    console.error('Error en API ventas:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la venta' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ventas = await prisma.ventas.findMany({
      include: {
        clientes: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            email: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return NextResponse.json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las ventas' },
      { status: 500 }
    );
  }
} 