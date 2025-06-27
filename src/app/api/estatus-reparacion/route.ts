import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los estatus de reparación
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const estatusReparacion = await prisma.estatus_reparacion.findMany({
      orderBy: {
        orden: 'asc'
      }
    });

    return new NextResponse(JSON.stringify(estatusReparacion), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener estatus de reparación:', error);
    return NextResponse.json(
      { error: 'Error al obtener estatus de reparación' },
      { status: 500 }
    );
  }
} 