import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tiposServicio = await prisma.tipoServicio.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(tiposServicio);
  } catch (error) {
    console.error('Error al obtener tipos de servicio:', error);
    return NextResponse.json(
      { error: 'Error al obtener tipos de servicio' },
      { status: 500 }
    );
  }
} 