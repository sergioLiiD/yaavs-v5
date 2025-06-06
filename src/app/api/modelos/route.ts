import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Obtener todos los modelos o filtrados por marca - Sin autenticación
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session en GET /api/modelos:', session);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const modelos = await prisma.modelo.findMany({
      include: {
        marcas: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log('Modelos encontrados:', modelos.length);
    return NextResponse.json(modelos);
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 