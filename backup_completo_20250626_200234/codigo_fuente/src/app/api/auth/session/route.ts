import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No hay sesión activa' }, { status: 401 });
    }

    return NextResponse.json({
      user: session.user,
      permissions: session.user.permissions,
      role: session.user.role
    });
  } catch (error) {
    console.error('Error al obtener la sesión:', error);
    return NextResponse.json({ error: 'Error al obtener la sesión' }, { status: 500 });
  }
} 