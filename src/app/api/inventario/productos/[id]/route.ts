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
      // Determinar qué tipo de relación está causando el problema
      const fieldName = error.meta?.field_name || '';
      let mensaje = 'No se puede eliminar el producto porque tiene registros relacionados';
      
      if (fieldName.includes('entradas_almacen')) {
        mensaje = 'No se puede eliminar el producto porque tiene entradas de almacén registradas';
      } else if (fieldName.includes('fotos_producto')) {
        mensaje = 'No se puede eliminar el producto porque tiene fotos asociadas';
      } else if (fieldName.includes('precios_venta')) {
        mensaje = 'No se puede eliminar el producto porque tiene precios de venta configurados';
      } else if (fieldName.includes('salidas_almacen')) {
        mensaje = 'No se puede eliminar el producto porque tiene salidas de almacén registradas';
      } else if (fieldName.includes('detalle_ventas')) {
        mensaje = 'No se puede eliminar el producto porque está asociado a ventas';
      }
      
      return NextResponse.json(
        { error: mensaje },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 