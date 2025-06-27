import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getSalidas(productoId?: string) {
  return prisma.salidaAlmacen.findMany({
    where: productoId ? { productoId: Number(productoId) } : undefined,
    include: {
      producto: {
        select: {
          nombre: true,
          sku: true,
        },
      },
      usuario: {
        select: {
          nombre: true,
          apellidoPaterno: true,
        },
      },
    },
    orderBy: {
      fecha: "desc",
    },
  });
}

export async function registrarSalida(
  productoId: number,
  cantidad: number,
  razon: string,
  tipo: "VENTA" | "DANO" | "MERMA" | "OTRO",
  referencia: string | undefined,
  usuarioId: number
) {
  return prisma.$transaction(async (tx: any) => {
    const producto = await tx.producto.findUnique({
      where: { id: productoId },
      select: {
        id: true,
        stock: true,
      },
    }) as any;

    if (!producto) {
      throw new Error("Producto no encontrado");
    }

    if (producto.stock < cantidad) {
      throw new Error("Stock insuficiente");
    }

    const salida = await tx.salidaAlmacen.create({
      data: {
        productoId,
        cantidad,
        razon,
        tipo,
        referencia,
        usuarioId,
      },
    });

    const productoActualizado = await tx.producto.update({
      where: { id: productoId },
      data: {
        stock: {
          decrement: cantidad,
        },
      } as any,
    });

    return { salida, productoActualizado };
  });
} 