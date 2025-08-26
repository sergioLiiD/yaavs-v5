import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const producto = await prisma.productos.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        categorias: true,
        marcas: true,
        modelos: true,
        proveedores: true,
        fotos_producto: true,
      },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Datos recibidos para actualizar:', data);

    // Preparar los datos para la actualización
    const updateData: any = {
      nombre: data.nombre,
      tipo: data.tipo,
      sku: data.sku || null,
      descripcion: data.descripcion || null,
      notasInternas: data.notasInternas || null,
      garantiaValor: parseInt(data.garantiaValor) || 0,
      garantiaUnidad: data.garantiaUnidad || 'dias',
      categoriaId: parseInt(data.categoriaId),
      marcaId: parseInt(data.marcaId),
      modeloId: parseInt(data.modeloId),
      proveedorId: data.proveedorId ? parseInt(data.proveedorId) : undefined,
    };

    const producto = await prisma.productos.update({
      where: {
        id: parseInt(params.id),
      },
      data: updateData,
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const productoId = parseInt(params.id);

    // Verificar que el producto existe
    const producto = await prisma.productos.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Intentar eliminar el producto
    await prisma.productos.delete({
      where: { id: productoId },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    
    // Si hay error de restricción de clave foránea
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene registros relacionados' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 