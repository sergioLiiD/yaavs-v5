import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, descripcion, activo, pasos, productos } = body;
    const id = parseInt(params.id);

    const reparacion = await prisma.reparaciones_frecuentes.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        activo,
        updatedAt: new Date(),
        pasos_reparacion_frecuente: {
          deleteMany: {},
          create: pasos.map((paso: { descripcion: string; orden: number }) => ({
            descripcion: paso.descripcion,
            orden: paso.orden,
            updatedAt: new Date()
          }))
        },
        productos_reparacion_frecuente: {
          deleteMany: {},
          create: productos.map((producto: {
            productoId: number;
            cantidad: number;
            precioVenta: number;
            conceptoExtra?: string;
            precioConceptoExtra?: number;
          }) => ({
            productoId: producto.productoId,
            cantidad: producto.cantidad,
            precioVenta: producto.precioVenta,
            conceptoExtra: producto.conceptoExtra,
            precioConceptoExtra: producto.precioConceptoExtra,
            updatedAt: new Date()
          }))
        }
      },
      include: {
        pasos_reparacion_frecuente: {
          orderBy: {
            orden: 'asc'
          }
        },
        productos_reparacion_frecuente: {
          include: {
            productos: true
          }
        }
      }
    });

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al actualizar reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reparación frecuente' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.reparaciones_frecuentes.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Reparación frecuente eliminada' });
  } catch (error) {
    console.error('Error al eliminar reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reparación frecuente' },
      { status: 500 }
    );
  }
} 