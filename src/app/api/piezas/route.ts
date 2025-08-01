import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TipoProducto } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Sesión completa:', JSON.stringify(session, null, 2));

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Usuario autenticado:', session.user);
    console.log('Buscando productos...');

    const productos = await prisma.productos.findMany({
      include: {
        marcas: true,
        modelos: true,
        categorias: true
      }
    });

    console.log('Productos encontrados:', productos);
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    console.error('Detalles del error:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const body = await request.json();
    const { nombre, marcaId, modeloId, stock, precioPromedio, sku, tipo, tipoServicioId } = body;

    console.log('Creando producto:', body);

    const producto = await prisma.productos.create({
      data: {
        nombre,
        marca_id: marcaId,
        modelo_id: modeloId,
        stock: stock || 0,
        precio_promedio: precioPromedio || 0,
        sku,
        tipo: (tipo as TipoProducto) || 'PIEZA',
        garantia_unidad: 'MESES',
        garantia_valor: 0,
        tipo_servicio_id: tipoServicioId || null,
        updated_at: new Date()
      },
      include: {
        marcas: true,
        modelos: true,
        categorias: true
      }
    });

    console.log('Producto creado:', producto);
    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error instanceof Error) {
      console.error('Detalles del error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 