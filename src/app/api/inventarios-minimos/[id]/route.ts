import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const producto = await prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      console.error('Producto no encontrado:', productoId);
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Buscar inventario mínimo existente
    const inventarioExistente = await prisma.inventarios_minimos.findUnique({
      where: { productoId },
    });

    console.log('Inventario existente:', inventarioExistente);

    let inventario;
    if (inventarioExistente) {
      console.log('Actualizando inventario existente');
      inventario = await prisma.$transaction(async (tx) => {
        const updated = await tx.inventarios_minimos.update({
          where: { productoId },
          data: { cantidadMinima },
        });
        return updated;
      });
    } else {
      console.log('Creando nuevo inventario');
      inventario = await prisma.$transaction(async (tx) => {
        const created = await tx.inventarios_minimos.create({
          data: {
            productoId,
            cantidadMinima,
            updatedAt: new Date(),
            createdAt: new Date(),
          },
        });
        return created;
      });
    }

    // Obtener el producto actualizado con su inventario mínimo
    const productoActualizado = await prisma.producto.findUnique({
      where: { id: productoId },
      include: {
        marcas: true,
        Modelo: true,
        proveedores: true,
        inventarios_minimos: true,
      },
    });

    if (!productoActualizado) {
      console.error('No se pudo obtener el producto actualizado');
      return NextResponse.json(
        { error: 'Error al obtener el producto actualizado' },
        { status: 500 }
      );
    }

    console.log('Inventario actualizado/creado:', inventario);
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

    // Verificar si existe el inventario mínimo
    const inventarioExistente = await prisma.inventarios_minimos.findUnique({
      where: { productoId },
    });

    if (!inventarioExistente) {
      console.error('Inventario mínimo no encontrado:', productoId);
      return NextResponse.json(
        { error: 'Inventario mínimo no encontrado' },
        { status: 404 }
      );
    }

    console.log('Eliminando inventario:', inventarioExistente);
    await prisma.inventarios_minimos.delete({
      where: { productoId },
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