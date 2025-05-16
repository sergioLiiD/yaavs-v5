import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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
          },
          take: 5
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 