import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await request.json();
    const { productoId, cantidad, precioCompra, notas } = body;

    // Validar que el producto existe
    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) }
    });

    if (!producto) {
      return new NextResponse('Producto no encontrado', { status: 404 });
    }

    // Calcular el nuevo precio promedio
    const nuevoStock = producto.stock + Number(cantidad);
    const nuevoPrecioPromedio = ((producto.precioPromedio * producto.stock) + (Number(precioCompra) * Number(cantidad))) / nuevoStock;

    // Crear la entrada y actualizar el producto en una transacción
    const [entrada] = await prisma.$transaction([
      prisma.entradaAlmacen.create({
        data: {
          productoId: Number(productoId),
          cantidad: Number(cantidad),
          precioCompra: Number(precioCompra),
          notas
        }
      }),
      prisma.producto.update({
        where: { id: Number(productoId) },
        data: {
          stock: nuevoStock,
          precioPromedio: nuevoPrecioPromedio
        }
      })
    ]);

    return NextResponse.json(entrada);
  } catch (error) {
    console.error('Error al registrar entrada:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 