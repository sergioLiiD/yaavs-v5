import { NextResponse } from 'next/server';
import { PrecioVentaInput, PrecioVentaUpdate } from '@/types/precios-venta';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tipo = searchParams.get('tipo');
    const sinPrecio = searchParams.get('sinPrecio');

    let precios;
    if (q) {
      precios = await prisma.precios_venta.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { marca: { contains: q, mode: 'insensitive' } },
            { modelo: { contains: q, mode: 'insensitive' } }
          ]
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } else if (tipo) {
      precios = await prisma.precios_venta.findMany({
        where: { tipo: tipo as 'PRODUCTO' | 'SERVICIO' },
        orderBy: {
          created_at: 'desc'
        }
      });
    } else if (sinPrecio === 'true') {
      precios = await prisma.precios_venta.findMany({
        where: {
          precio_venta: 0
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } else {
      precios = await prisma.precios_venta.findMany({
        orderBy: {
          created_at: 'desc'
        }
      });
    }

    return NextResponse.json(precios);
  } catch (error) {
    console.error('Error al obtener precios:', error);
    return NextResponse.json({ error: 'Error al obtener precios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const precio = await request.json();
    const nuevoPrecio = await prisma.precios_venta.create({
      data: {
        tipo: precio.tipo,
        nombre: precio.nombre,
        marca: precio.marca,
        modelo: precio.modelo,
        precio_compra_promedio: precio.precio_compra_promedio,
        precio_venta: precio.precio_venta,
        producto_id: precio.producto_id || null,
        servicio_id: precio.servicio_id || null,
        created_by: 'system',
        updated_by: 'system'
      }
    });
    return NextResponse.json(nuevoPrecio);
  } catch (error) {
    console.error('Error al crear precio:', error);
    return NextResponse.json({ error: 'Error al crear precio' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const precio = await request.json();
    const precioActualizado = await prisma.precios_venta.update({
      where: { id: precio.id },
      data: {
        tipo: precio.tipo,
        nombre: precio.nombre,
        marca: precio.marca,
        modelo: precio.modelo,
        precio_compra_promedio: precio.precio_compra_promedio,
        precio_venta: precio.precio_venta,
        producto_id: precio.producto_id || null,
        servicio_id: precio.servicio_id || null,
        updated_by: 'system'
      }
    });
    return NextResponse.json(precioActualizado);
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    return NextResponse.json({ error: 'Error al actualizar precio' }, { status: 500 });
  }
} 