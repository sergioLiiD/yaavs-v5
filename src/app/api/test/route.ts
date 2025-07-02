import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma-docker';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('🧪 Probando endpoint GET /api/test');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    return NextResponse.json({ 
      message: 'API funcionando correctamente',
      session: session ? 'Autenticado' : 'No autenticado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en endpoint de prueba:', error);
    return NextResponse.json(
      { error: 'Error en endpoint de prueba', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('🧪 Probando endpoint POST /api/test');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    const body = await request.json();
    console.log('Datos recibidos:', body);
    
    // Probar conexión a la base de datos
    const usuariosCount = await db.usuarios.count();
    console.log('Número de usuarios en BD:', usuariosCount);
    
    return NextResponse.json({ 
      message: 'POST funcionando correctamente',
      session: session ? 'Autenticado' : 'No autenticado',
      dataReceived: body,
      usuariosCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en endpoint de prueba POST:', error);
    return NextResponse.json(
      { error: 'Error en endpoint de prueba POST', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 