import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const piezaId = parseInt(params.id);
    console.log('Buscando pieza:', piezaId);

    const pieza = await prisma.pieza.findUnique({
      where: {
        id: piezaId,
      },
    });

    if (!pieza) {
      return new NextResponse('Pieza no encontrada', { status: 404 });
    }

    console.log('Pieza encontrada:', pieza);
    return NextResponse.json(pieza);
  } catch (error) {
    console.error('Error al obtener pieza:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 