import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

// GET: Obtener todas las marcas - Sin autenticación
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const marcas = await prisma.marcas.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(marcas);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 