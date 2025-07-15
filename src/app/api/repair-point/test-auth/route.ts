import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptionsRepairPoint } from '@/lib/auth-repair-point';

export async function GET() {
  try {
    console.log('🔍 Test Auth - Iniciando...');
    const session = await getServerSession(authOptionsRepairPoint);
    
    console.log('🔍 Session completa:', JSON.stringify(session, null, 2));
    console.log('🔍 Session user:', session?.user);

    if (!session?.user) {
      console.log('❌ No hay sesión de usuario');
      return NextResponse.json(
        { error: 'No autorizado', session: null },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: session.user,
      message: 'Autenticación exitosa'
    });

  } catch (error) {
    console.error('Error en test auth:', error);
    return NextResponse.json(
      { error: 'Error en autenticación', details: error },
      { status: 500 }
    );
  }
} 