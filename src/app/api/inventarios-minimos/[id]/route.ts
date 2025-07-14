import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Iniciando actualización de inventario mínimo');
    const { cantidadMinima } = await request.json();
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      console.error('ID de producto inválido:', params.id);
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    if (typeof cantidadMinima !== 'number' || cantidadMinima < 0) {
      console.error('Cantidad mínima inválida:', cantidadMinima);
      return NextResponse.json(
        { error: 'La cantidad mínima debe ser un número positivo' },
        { status: 400 }
      );
    }

    console.log('Datos recibidos:', { productoId, cantidadMinima });

    // Verificar si el producto existe
    const producto = await prisma.productos.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      console.error('Producto no encontrado:', productoId);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el stock mínimo directamente en el producto
    const productoActualizado = await prisma.productos.update({
      where: { id: productoId },
      data: { stock_minimo: cantidadMinima },
      include: {
        marcas: true,
        modelos: true
      },
    });

    console.log('Producto actualizado:', productoActualizado);
    
    // Devolver el producto actualizado
    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error('Error en PUT /api/inventarios-minimos/[id]:', error);
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
    console.log('Iniciando eliminación de inventario mínimo');
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      console.error('ID de producto inválido:', params.id);
      return NextResponse.json(
        { error: 'ID de producto inválido' },
        { status: 400 }
      );
    }

    // Verificar si existe el producto
    const producto = await prisma.productos.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      console.error('Producto no encontrado:', productoId);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el stock mínimo a 0
    await prisma.productos.update({
      where: { id: productoId },
      data: { stock_minimo: 0 },
    });

    return NextResponse.json({ message: 'Inventario mínimo eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /api/inventarios-minimos/[id]:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el inventario mínimo' },
      { status: 500 }
    );
  }
} 