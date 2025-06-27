import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productoId = searchParams.get('productoId');

    const where = productoId ? { producto_id: Number(productoId) } : {};

    // Obtener salidas
    const salidas = await prisma.salidas_almacen.findMany({
      where,
      select: {
        id: true,
        producto_id: true,
        cantidad: true,
        razon: true,
        tipo: true,
        referencia: true,
        fecha: true,
        usuarios: {
          select: {
            nombre: true,
            apellido_paterno: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Obtener entradas
    const entradas = await prisma.entradas_almacen.findMany({
      where,
      select: {
        id: true,
        producto_id: true,
        cantidad: true,
        precio_compra: true,
        notas: true,
        fecha: true,
        proveedor_id: true,
        usuarios: {
          select: {
            nombre: true,
            apellido_paterno: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Obtener los proveedores para las entradas
    const proveedoresIds = entradas
      .filter(e => e.proveedor_id)
      .map(e => e.proveedor_id as number);

    const proveedores = await prisma.proveedores.findMany({
      where: {
        id: {
          in: proveedoresIds
        }
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    // Combinar entradas con proveedores
    const entradasConProveedores = entradas.map(entrada => ({
      ...entrada,
      proveedores: entrada.proveedor_id ? proveedores.find(p => p.id === entrada.proveedor_id) : null
    }));

    // Combinar y ordenar por fecha
    const historial = [
      ...salidas.map(s => ({ ...s, tipo: 'SALIDA' })),
      ...entradasConProveedores.map(e => ({ ...e, tipo: 'ENTRADA' }))
    ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    return NextResponse.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
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
    const producto = await prisma.productos.findUnique({
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
      const salida = await tx.salidas_almacen.create({
        data: {
          producto_id: Number(productoId),
          cantidad: Number(cantidad),
          tipo,
          razon,
          referencia,
          usuario_id: Number(session.user.id),
          updated_at: new Date(),
        },
      });

      const updateData: Prisma.productosUpdateInput = {
        stock: {
          decrement: Number(cantidad),
        },
      };

      await tx.productos.update({
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