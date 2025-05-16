import { NextResponse } from 'next/server';
import { PrecioVentaInput, PrecioVentaUpdate } from '@/types/precios-venta';
import {
  getAllPrecios,
  getPrecioById,
  createPrecio,
  updatePrecio,
  getPreciosSinVenta,
  searchPrecios,
  getPreciosByTipo,
} from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tipo = searchParams.get('tipo');
    const sinPrecio = searchParams.get('sinPrecio');

    let precios;
    if (q) {
      precios = await searchPrecios(q);
    } else if (tipo) {
      precios = await getPreciosByTipo(tipo as 'PRODUCTO' | 'SERVICIO');
    } else if (sinPrecio === 'true') {
      precios = await getPreciosSinVenta();
    } else {
      precios = await getAllPrecios();
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
    const nuevoPrecio = await createPrecio(precio);
    return NextResponse.json(nuevoPrecio);
  } catch (error) {
    console.error('Error al crear precio:', error);
    return NextResponse.json({ error: 'Error al crear precio' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const precio = await request.json();
    const precioActualizado = await updatePrecio(precio);
    return NextResponse.json(precioActualizado);
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    return NextResponse.json({ error: 'Error al actualizar precio' }, { status: 500 });
  }
} 