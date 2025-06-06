import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session en GET /api/tipos-servicio:', session);

    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const tiposServicio = await prisma.tipoServicio.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log('Tipos de servicio encontrados:', tiposServicio.length);
    return NextResponse.json(tiposServicio);
  } catch (error) {
    console.error('Error al obtener tipos de servicio:', error);
    return new NextResponse('Error al obtener los tipos de servicio', { status: 500 });
  }
} 