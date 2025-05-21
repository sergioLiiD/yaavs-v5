import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateUsuarioDTO, NivelUsuario } from '@/types/usuario';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Esquema de validación para el registro de usuarios
const usuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  nivel: z.enum(['ADMINISTRADOR', 'TECNICO', 'ATENCION_CLIENTE'] as const),
  activo: z.boolean().optional().default(true)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// GET /api/usuarios
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');

    const where: Prisma.UsuarioWhereInput = {};
    if (rol && ['ADMINISTRADOR', 'TECNICO', 'ATENCION_CLIENTE'].includes(rol)) {
      where.nivel = rol as NivelUsuario;
    }

    const usuarios = await prisma.usuario.findMany({
      where,
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
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Error en la base de datos', code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST /api/usuarios
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Datos recibidos:', { ...body, password: '[REDACTED]' });

    // Validar datos con el esquema
    const validatedData = usuarioSchema.parse(body);
    console.log('Datos validados correctamente');

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: validatedData.email }
    });

    if (usuarioExistente) {
      console.log('Email ya registrado:', validatedData.email);
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Crear el usuario
    console.log('Creando usuario...');
    const usuario = await prisma.usuario.create({
      data: {
        email: validatedData.email,
        nombre: validatedData.nombre,
        apellidoPaterno: validatedData.apellidoPaterno,
        apellidoMaterno: validatedData.apellidoMaterno || '',
        passwordHash,
        nivel: validatedData.nivel,
        activo: validatedData.activo
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        nivel: true,
        activo: true,
        createdAt: true,
        updatedAt: true
      }
    });
    console.log('Usuario creado:', usuario.id);

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Error en la base de datos', code: error.code },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
} 