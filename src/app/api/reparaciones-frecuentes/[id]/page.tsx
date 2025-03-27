import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const reparacion = await prisma.reparacionFrecuente.findUnique({
      where: { id },
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

    if (!reparacion) {
      return NextResponse.json(
        { error: 'Reparación frecuente no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al obtener reparación frecuente:', error);
    return NextResponse.json(
      { error: 'Error al obtener reparación frecuente' },
      { status: 500 }
    );
  }
} 