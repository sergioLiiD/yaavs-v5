import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        categoria: true,
        marca: true,
        modelo: true,
        proveedor: true,
        fotos: true,
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

    const producto = await prisma.producto.update({
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

    await prisma.producto.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 