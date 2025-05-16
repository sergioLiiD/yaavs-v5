import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const nombre = request.nextUrl.searchParams.get('nombre');

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const productoExistente = await prisma.producto.findFirst({
      where: {
        nombre: {
          equals: nombre,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        nombre: true,
        sku: true,
        tipo: true
      }
    });

    return NextResponse.json({
      existe: !!productoExistente,
      producto: productoExistente
    });
  } catch (error) {
    console.error('Error al verificar producto:', error);
    return NextResponse.json(
      { error: 'Error al verificar el producto' },
      { status: 500 }
    );
  }
} 