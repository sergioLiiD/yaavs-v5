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
        marcas: {
          select: {
            id: true,
            nombre: true,
          },
        },
        Modelo: {
          select: {
            id: true,
            nombre: true,
          },
        },
        inventarios_minimos: {
          select: {
            id: true,
            cantidadMinima: true,
            createdAt: true,
            updatedAt: true,
          },
        },
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