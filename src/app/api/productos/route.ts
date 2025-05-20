import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      select: {
        id: true,
        nombre: true,
        precioPromedio: true,
        stock: true,
        sku: true,
        tipo: true,
        marca: {
          select: {
            id: true,
            nombre: true,
          },
        },
        modelo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        inventarioMinimo: true,
        proveedor: {
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