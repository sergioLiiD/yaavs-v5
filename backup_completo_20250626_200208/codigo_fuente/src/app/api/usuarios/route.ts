import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateUsuarioDTO } from '@/types/usuario';
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
  activo: z.boolean().optional().default(true)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// GET /api/usuarios
export async function GET(request: Request) {
  try {
    console.log('Iniciando GET /api/usuarios');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario es administrador o tiene el permiso USERS_VIEW
    if (session.user.role !== 'ADMINISTRADOR' && !session.user.permissions.includes('USERS_VIEW')) {
      // Si está solicitando técnicos específicamente, permitir el acceso
      const { searchParams } = new URL(request.url);
      const rol = searchParams.get('rol');
      if (rol !== 'TECNICO') {
        console.log('Usuario no tiene permisos');
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    console.log('Rol filtrado:', rol);

    try {
      const usuarios = await prisma.usuario.findMany({
        where: rol ? {
          usuarioRoles: {
            some: {
              rol: {
                nombre: rol
              }
            }
          }
        } : undefined,
        orderBy: { nombre: 'asc' },
        include: {
          usuarioRoles: {
            include: {
              rol: {
                include: {
                  permisos: {
                    include: {
                      permiso: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      console.log('Usuarios encontrados:', usuarios);
      return NextResponse.json(usuarios);
    } catch (dbError) {
      console.error('Error en consulta a la base de datos:', dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        return NextResponse.json(
          { 
            error: 'Error en la base de datos', 
            code: dbError.code,
            message: dbError.message,
            meta: dbError.meta
          },
          { status: 500 }
        );
      }
      throw dbError;
    }
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
    console.log('Iniciando POST /api/usuarios');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      console.log('Usuario no autenticado');
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
        activo: validatedData.activo,
        updatedAt: new Date(),
        createdAt: new Date(),
        usuarioRoles: {
          create: body.roles?.map((rolId: number) => ({
            rolId
          })) || []
        }
      },
      include: {
        usuarioRoles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    });
    console.log('Usuario creado:', usuario.id);
    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 