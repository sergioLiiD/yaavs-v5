import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/puntos-recoleccion/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const punto = await prisma.puntos_recoleccion.findUnique({
      where: {
        id: params.id,
      },
      include: {
        branches: true,
        parent: true,
      },
    });

    if (!punto) {
      return NextResponse.json(
        { error: 'Punto de recolección no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(punto);
  } catch (error) {
    console.error('Error al obtener punto de recolección:', error);
    return NextResponse.json(
      { error: 'Error al obtener punto de recolección' },
      { status: 500 }
    );
  }
}

// PUT /api/puntos-recoleccion/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    const punto = await prisma.puntos_recoleccion.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        url: data.url,
        schedule: data.schedule,
        location: data.location,
        isHeadquarters: data.isHeadquarters,
        isRepairPoint: data.isRepairPoint,
        parentId: data.parentId,
      },
    });

    return NextResponse.json(punto);
  } catch (error) {
    console.error('Error al actualizar punto de recolección:', error);
    return NextResponse.json(
      { error: 'Error al actualizar punto de recolección' },
      { status: 500 }
    );
  }
}

// DELETE /api/puntos-recoleccion/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.puntos_recoleccion.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Punto de recolección eliminado' });
  } catch (error) {
    console.error('Error al eliminar punto de recolección:', error);
    return NextResponse.json(
      { error: 'Error al eliminar punto de recolección' },
      { status: 500 }
    );
  }
} 