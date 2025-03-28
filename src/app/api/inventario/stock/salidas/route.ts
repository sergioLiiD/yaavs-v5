import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get('productoId');

    const where = productoId ? { productoId: Number(productoId) } : {};

    const salidas = await prisma.salidaAlmacen.findMany({
      where,
      include: {
        producto: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return NextResponse.json(salidas);
  } catch (error) {
    console.error('Error al obtener salidas:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await request.json();
    const { productoId, cantidad, tipo, razon, referencia } = body;

    // Validar que el producto existe y tiene suficiente stock
    const producto = await prisma.producto.findUnique({
      where: { id: Number(productoId) },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!producto) {
      return new NextResponse('Producto no encontrado', { status: 404 });
    }

    if (producto.stock < Number(cantidad)) {
      return new NextResponse('Stock insuficiente', { status: 400 });
    }

    // Crear la salida y actualizar el producto en una transacción
    const salida = await prisma.$transaction(async (tx) => {
      const salida = await tx.salidaAlmacen.create({
        data: {
          productoId: Number(productoId),
          cantidad: Number(cantidad),
          tipo,
          razon,
          referencia,
          usuarioId: Number(session.user.id),
        },
      });

      const updateData: Prisma.ProductoUpdateInput = {
        stock: {
          decrement: Number(cantidad),
        },
      };

      await tx.producto.update({
        where: { id: Number(productoId) },
        data: updateData,
      });

      return salida;
    });

    return NextResponse.json(salida);
  } catch (error) {
    console.error('Error al registrar salida:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 