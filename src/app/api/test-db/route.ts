import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Intentar una consulta simple
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Conexión a la base de datos exitosa',
      result
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
} 