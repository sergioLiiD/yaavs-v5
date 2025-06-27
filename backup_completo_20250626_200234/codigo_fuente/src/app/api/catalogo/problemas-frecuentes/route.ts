import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const modeloId = req.nextUrl.searchParams.get('modeloId');

    if (!modeloId) {
      return NextResponse.json(
        { error: 'ID de modelo no proporcionado' },
        { status: 400 }
      );
    }

    const problemasFrecuentes = await prisma.problemaFrecuente.findMany({
      where: {
        modeloId: parseInt(modeloId),
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(problemasFrecuentes);
  } catch (error) {
    console.error('Error al obtener problemas frecuentes:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 