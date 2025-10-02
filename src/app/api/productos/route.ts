import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let where: any = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    const productos = await prisma.productos.findMany({
      where,
      select: {
        id: true,
        sku: true,
        nombre: true,
        descripcion: true,
        precio_promedio: true,
        stock: true,
        tipo: true,
        tipo_servicio_id: true,
        categoria_id: true,
        marca_id: true,
        modelo_id: true,
        created_at: true,
        updated_at: true,
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
        tipos_servicio: {
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
        precios_venta: {
          select: {
            precio_venta: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
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