import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cantidadMinima } = await request.json();
    const productoId = parseInt(params.id);

    // Primero, buscar si existe un inventario mínimo para este producto
    const inventarioExistente = await prisma.inventarioMinimo.findUnique({
      where: {
        productoId,
      },
    });

    let inventarioMinimo;
    if (inventarioExistente) {
      // Si existe, actualizar
      inventarioMinimo = await prisma.inventarioMinimo.update({
        where: {
          id: inventarioExistente.id,
        },
        data: {
          cantidadMinima,
        },
      });
    } else {
      // Si no existe, crear uno nuevo
      inventarioMinimo = await prisma.inventarioMinimo.create({
        data: {
          productoId,
          cantidadMinima,
        },
      });
    }

    return NextResponse.json(inventarioMinimo);
  } catch (error) {
    console.error('Error al actualizar inventario mínimo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el inventario mínimo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = parseInt(params.id);

    // Primero, buscar si existe un inventario mínimo para este producto
    const inventarioExistente = await prisma.inventarioMinimo.findUnique({
      where: {
        productoId,
      },
    });

    if (inventarioExistente) {
      // Si existe, eliminarlo
      await prisma.inventarioMinimo.delete({
        where: {
          id: inventarioExistente.id,
        },
      });
    }

    return NextResponse.json({ message: 'Inventario mínimo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar inventario mínimo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el inventario mínimo' },
      { status: 500 }
    );
  }
} 