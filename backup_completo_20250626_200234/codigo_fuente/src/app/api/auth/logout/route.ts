import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Eliminar la cookie del token
    cookies().set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { error: 'Error al cerrar la sesión' },
      { status: 500 }
    );
  }
} 