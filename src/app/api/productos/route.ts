import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        marca: {
          select: {
            nombre: true,
          },
        },
        modelo: {
          select: {
            nombre: true,
          },
        },
        inventarioMinimo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
} 