import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UsuarioService } from '@/services/usuarioService';
import { CreateUsuarioDTO, NivelUsuario } from '@/types/usuario';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/usuarios
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol') as NivelUsuario;

    const usuarios = await prisma.usuario.findMany({
      where: rol ? {
        nivel: rol
      } : undefined,
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        email: true,
        nivel: true,
        activo: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, nombre, apellidoPaterno, apellidoMaterno, password, nivel } = body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario
    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        passwordHash,
        nivel: nivel || 'TECNICO',
        activo: true
      }
    });

    // Omitir el passwordHash de la respuesta
    const { passwordHash: _, ...usuarioSinPassword } = usuario;

    return NextResponse.json(usuarioSinPassword);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
} 