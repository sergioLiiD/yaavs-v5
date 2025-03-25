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
    if (!session || !['ADMINISTRADOR', 'GERENTE'].includes(session.user.nivel)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const producto = {
      sku: formData.get('sku') as string,
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      notasInternas: formData.get('notasInternas') as string,
      garantiaValor: parseInt(formData.get('garantiaValor') as string),
      garantiaUnidad: formData.get('garantiaUnidad') as string,
      categoriaId: parseInt(formData.get('categoriaId') as string),
      marcaId: parseInt(formData.get('marcaId') as string),
      modeloId: parseInt(formData.get('modeloId') as string),
      proveedorId: parseInt(formData.get('proveedorId') as string),
    };

    // Validar campos requeridos
    if (!producto.sku || !producto.nombre || !producto.descripcion || 
        !producto.garantiaValor || !producto.garantiaUnidad ||
        !producto.categoriaId || !producto.marcaId || 
        !producto.modeloId || !producto.proveedorId) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el SKU no exista (excepto para el mismo producto)
    const existingSKU = await prisma.producto.findFirst({
      where: {
        sku: producto.sku,
        NOT: { id: parseInt(params.id) },
      },
    });

    if (existingSKU) {
      return NextResponse.json(
        { error: 'El SKU ya existe' },
        { status: 400 }
      );
    }

    // Actualizar el producto
    const productoActualizado = await prisma.producto.update({
      where: { id: parseInt(params.id) },
      data: producto,
      include: {
        categoria: true,
        marca: true,
        modelo: true,
        proveedor: true,
        fotos: true,
      },
    });

    // Procesar fotos si existen
    const fotos = formData.getAll('fotos') as File[];
    if (fotos.length > 0) {
      // Aquí implementaremos la lógica para subir las fotos
      // y crear los registros en la tabla fotos_producto
    }

    return NextResponse.json(productoActualizado);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
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
    if (!session || !['ADMINISTRADOR', 'GERENTE'].includes(session.user.nivel)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Eliminar el producto y sus fotos (las fotos se eliminarán automáticamente por la relación onDelete: Cascade)
    await prisma.producto.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
} 