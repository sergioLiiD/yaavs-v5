import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { cantidadMinima } = await request.json();
    const productoId = parseInt(params.id);

    const inventarioMinimo = await prisma.inventarioMinimo.upsert({
      where: {
        productoId,
      },
      update: {
        cantidadMinima,
      },
      create: {
        productoId,
        cantidadMinima,
      },
    });

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

    await prisma.inventarioMinimo.delete({
      where: {
        productoId,
      },
    });

    return NextResponse.json({ message: 'Inventario mínimo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar inventario mínimo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el inventario mínimo' },
      { status: 500 }
    );
  }
} 