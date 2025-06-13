import { NextResponse } from 'next/server';
import { PrecioVentaInput, PrecioVentaUpdate } from '@/types/precios-venta';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const tipo = searchParams.get('tipo');
    const sinPrecio = searchParams.get('sinPrecio');

    let precios;
    if (q) {
      precios = await prisma.PrecioVenta.findMany({
        where: {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { marca: { contains: q, mode: 'insensitive' } },
            { modelo: { contains: q, mode: 'insensitive' } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (tipo) {
      precios = await prisma.PrecioVenta.findMany({
        where: { tipo: tipo as 'PRODUCTO' | 'SERVICIO' },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (sinPrecio === 'true') {
      precios = await prisma.PrecioVenta.findMany({
        where: {
          precio_venta: 0
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      precios = await prisma.PrecioVenta.findMany({
        orderBy: {
          createdAt: 'desc'
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
    const nuevoPrecio = await prisma.PrecioVenta.create({
      data: {
        tipo: precio.tipo,
        nombre: precio.nombre,
        marca: precio.marca,
        modelo: precio.modelo,
        precioCompraPromedio: precio.precioCompraPromedio || 0,
        precioVenta: precio.precioVenta,
        productoId: precio.productoId || null,
        servicioId: precio.servicioId || null,
        createdBy: 'system',
        updatedBy: 'system'
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
    const precioActualizado = await prisma.PrecioVenta.update({
      where: { id: precio.id },
      data: {
        tipo: precio.tipo,
        nombre: precio.nombre,
        marca: precio.marca,
        modelo: precio.modelo,
        precioCompraPromedio: precio.precioCompraPromedio || 0,
        precioVenta: precio.precioVenta,
        productoId: precio.productoId || null,
        servicioId: precio.servicioId || null,
        updatedBy: 'system'
      }
    });
    return NextResponse.json(precioActualizado);
  } catch (error) {
    console.error('Error al actualizar precio:', error);
    return NextResponse.json({ error: 'Error al actualizar precio' }, { status: 500 });
  }
} 