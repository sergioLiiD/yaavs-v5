import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const productos = await prisma.producto.findMany({
      include: {
        marca: {
          select: {
            nombre: true
          }
        },
        modelo: {
          select: {
            nombre: true
          }
        },
        entradas: {
          orderBy: {
            fecha: 'desc'
          }
        }
      },
      orderBy: {
        stock: 'asc'
      }
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 