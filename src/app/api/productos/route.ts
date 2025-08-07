import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let whereClause: any = {
      tipo: 'PRODUCTO',
      stock: {
        gt: 0
      }
    };

    if (search) {
      whereClause.OR = [
        {
          nombre: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          sku: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const productos = await prisma.productos.findMany({
      where: whereClause,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        stock: true,
        precio_promedio: true,
        sku: true,
        categorias: {
          select: {
            id: true,
            nombre: true
          }
        },
        marcas: {
          select: {
            id: true,
            nombre: true
          }
        },
        modelos: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      },
      take: search ? 10 : undefined
    });

    const productosFormateados = productos.map(p => ({
      ...p,
      precio: p.precio_promedio
    }));

    return NextResponse.json(productosFormateados);
  } catch (error) {
    console.error('Error en API productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
} 