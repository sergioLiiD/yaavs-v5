import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Eliminar la cookie del token con todas las opciones necesarias
    const response = NextResponse.json({ message: 'Sesión cerrada correctamente' });
    
    response.cookies.set('cliente_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    });

    // También eliminar con path específico
    response.cookies.set('cliente_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/cliente',
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar la sesión' },
      { status: 500 }
    );
  }
} 