import { NextResponse } from 'next/server';
import { ClienteService } from '@/services/clienteService';
import { z } from 'zod';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Esquema de validación para el login
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar los datos de entrada
    const validatedData = loginSchema.parse(body);

    // Verificar credenciales
    const cliente = await ClienteService.verifyCredentials(
      validatedData.email,
      validatedData.password
    );

    if (!cliente) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = sign(
      {
        id: cliente.id,
        email: cliente.email,
        tipo: 'CLIENTE'
      },
      process.env.JWT_SECRET || 'tu_secreto_seguro_para_jwt_aqui',
      { expiresIn: '24h' }
    );

    // Configurar la cookie
    cookies().set('cliente_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
    });

    // Omitir el passwordHash de la respuesta
    const { passwordHash, ...clienteSinPassword } = cliente;

    return NextResponse.json({
      cliente: clienteSinPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error en login de cliente:', error);
    return NextResponse.json(
      { error: 'Error durante el inicio de sesión' },
      { status: 500 }
    );
  }
} 