import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma-docker';
import { compare } from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('=== TEST LOGIN DIRECTO ===');
    console.log('Email:', email);

    // Buscar usuario directamente
    const user = await db.usuarios.findUnique({
      where: { 
        email: email,
        activo: true
      }
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    console.log('Usuario encontrado:', user.email);

    // Verificar contraseña
    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      console.log('Contraseña inválida');
      return NextResponse.json({ error: 'Contraseña inválida' }, { status: 401 });
    }

    console.log('¡LOGIN EXITOSO!');
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        nombre: user.nombre 
      } 
    });

  } catch (error) {
    console.error('Error en test login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 