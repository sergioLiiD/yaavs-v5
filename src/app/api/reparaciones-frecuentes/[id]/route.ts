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

    const reparacion = await prisma.reparacionFrecuente.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        activo,
        pasos: {
          deleteMany: {},
          create: pasos.map((paso: { descripcion: string; orden: number }) => ({
            descripcion: paso.descripcion,
            orden: paso.orden
          }))
        },
        productos: {
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
            precioConceptoExtra: producto.precioConceptoExtra
          }))
        }
      },
      include: {
        pasos: {
          orderBy: {
            orden: 'asc'
          }
        },
        productos: {
          include: {
            producto: true
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
    
    await prisma.reparacionFrecuente.delete({
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