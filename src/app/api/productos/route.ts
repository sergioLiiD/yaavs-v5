import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const productos = await prisma.productos.findMany({
      select: {
        id: true,
        nombre: true,
        precio_promedio: true,
        stock: true,
        tipo: true,
        marcas: {
          select: {
            id: true,
            nombre: true,
          },
        },
        modelos: {
          select: {
            id: true,
            nombre: true,
          },
        },
        stock_minimo: true,
        stock_maximo: true,
        proveedores: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log('Productos desde la API:', productos);

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
} 