import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateUsuarioDTO, NivelUsuario } from '@/types/usuario';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

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
    console.log('Iniciando GET /api/usuarios');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');
    console.log('Rol filtrado:', rol);

    try {
      const usuarios = await prisma.usuario.findMany({
        where: rol ? {
          nivel: rol as NivelUsuario
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

      console.log(`Usuarios encontrados: ${usuarios.length}`);
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
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { 
          error: 'Error en la base de datos', 
          code: error.code,
          message: error.message,
          meta: error.meta
        },
        { status: 500 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Error al obtener usuarios',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
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
export async function POST(req: NextRequest) {
  console.log('POST /api/usuarios - Iniciando...');
  
  try {
    // Configurar headers CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Manejar solicitud OPTIONS para CORS
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    const session = await getServerSession(authOptions);
    console.log('POST /api/usuarios - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/usuarios - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers });
    }

    const data = await req.json();
    console.log('POST /api/usuarios - Datos recibidos:', { ...data, password: '[REDACTED]' });

    // Validar datos requeridos
    if (!data.nombre || !data.email || !data.password || !data.nivel) {
      console.log('POST /api/usuarios - Datos incompletos:', { 
        nombre: !!data.nombre, 
        email: !!data.email, 
        password: !!data.password,
        nivel: !!data.nivel 
      });
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400, headers }
      );
    }

    try {
      // Verificar conexión a la base de datos
      await prisma.$connect();
      console.log('Conexión a la base de datos establecida');

      // Verificar si el email ya existe
      const existingUser = await prisma.usuario.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        console.log('POST /api/usuarios - Email ya existe:', data.email);
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400, headers }
        );
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(data.password, 10);
      console.log('Contraseña encriptada correctamente');

      // Crear usuario
      console.log('Intentando crear usuario con datos:', {
        nombre: data.nombre,
        email: data.email,
        nivel: data.nivel,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno
      });

      const usuario = await prisma.usuario.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          passwordHash: hashedPassword,
          nivel: data.nivel,
          apellidoPaterno: data.apellidoPaterno || '',
          apellidoMaterno: data.apellidoMaterno || '',
          updatedAt: new Date()
        }
      });

      console.log('POST /api/usuarios - Usuario creado:', { ...usuario, passwordHash: '[REDACTED]' });
      
      // Cerrar la conexión
      await prisma.$disconnect();
      
      return NextResponse.json(
        { ...usuario, passwordHash: undefined },
        { status: 201, headers }
      );
    } catch (error) {
      console.error('POST /api/usuarios - Error en la consulta:', error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Error de Prisma:', {
          code: error.code,
          message: error.message,
          meta: error.meta
        });
      }
      
      // Intentar cerrar la conexión en caso de error
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error al cerrar la conexión:', disconnectError);
      }

      return NextResponse.json(
        { 
          error: 'Error al crear el usuario',
          details: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('POST /api/usuarios - Error general:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 