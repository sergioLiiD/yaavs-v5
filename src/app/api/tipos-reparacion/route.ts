import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    console.log('Iniciando consulta de tipos de reparación...');
    
    const result = await db.query(
      `SELECT id, nombre, descripcion 
       FROM tipos_reparacion 
       ORDER BY nombre ASC`
    );

    console.log('Tipos de reparación encontrados:', result.rows.length);

    if (!result.rows || result.rows.length === 0) {
      console.log('No se encontraron tipos de reparación');
      return NextResponse.json([]);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error detallado al obtener tipos de reparación:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Error al obtener tipos de reparación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 