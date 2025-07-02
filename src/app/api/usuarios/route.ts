import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateUsuarioDTO } from '@/types/usuario';
import { db } from '@/lib/prisma-docker';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
      const usuarios = await db.usuarios.findMany({
        where: rol ? {
          usuarios_roles: {
            some: {
              roles: {
                nombre: rol
              }
            }
          }
        } : undefined,
        orderBy: { nombre: 'asc' },
        include: {
          usuarios_roles: {
            include: {
              roles: {
                include: {
                  roles_permisos: {
                    include: {
                      permisos: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      console.log('Usuarios encontrados:', usuarios);
      
      // Mapear los datos de snake_case (DB) a camelCase (frontend)
      const usuariosMapeados = usuarios.map(usuario => ({
        ...usuario,
        apellidoPaterno: usuario.apellido_paterno,
        apellidoMaterno: usuario.apellido_materno,
        createdAt: usuario.created_at,
        updatedAt: usuario.updated_at,
        // Mantener las relaciones con sus nombres correctos
        usuarioRoles: usuario.usuarios_roles?.map(ur => ({
          ...ur,
          usuarioId: ur.usuario_id,
          rolId: ur.rol_id,
          createdAt: ur.created_at,
          updatedAt: ur.updated_at,
          rol: ur.roles
        }))
      }));
      
      return NextResponse.json(usuariosMapeados);
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
    try {
      const validatedData = usuarioSchema.parse(body);
      console.log('Datos validados correctamente');
    } catch (validationError) {
      console.error('Error de validación:', validationError);
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationError instanceof Error ? validationError.message : 'Error de validación' },
        { status: 400 }
      );
    }

    const validatedData = usuarioSchema.parse(body);

    // Verificar si el usuario ya existe
    try {
      const usuarioExistente = await db.usuarios.findUnique({
        where: { email: validatedData.email }
      });

      if (usuarioExistente) {
        console.log('Email ya registrado:', validatedData.email);
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error('Error al verificar usuario existente:', dbError);
      return NextResponse.json(
        { error: 'Error al verificar usuario existente', details: dbError instanceof Error ? dbError.message : 'Error de base de datos' },
        { status: 500 }
      );
    }

    // Encriptar la contraseña
    try {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validatedData.password, salt);
      console.log('Contraseña encriptada correctamente');

      // Crear el usuario
      console.log('Creando usuario...');
      console.log('Datos a crear:', {
        email: validatedData.email,
        nombre: validatedData.nombre,
        apellido_paterno: validatedData.apellidoPaterno,
        apellido_materno: validatedData.apellidoMaterno || '',
        activo: validatedData.activo,
        roles: body.roles
      });

      // Crear el usuario primero sin roles
      const usuario = await db.usuarios.create({
        data: {
          email: validatedData.email,
          nombre: validatedData.nombre,
          apellido_paterno: validatedData.apellidoPaterno,
          apellido_materno: validatedData.apellidoMaterno || '',
          password_hash: passwordHash,
          activo: validatedData.activo,
          updated_at: new Date(),
          created_at: new Date()
        }
      });
      
      console.log('Usuario creado exitosamente:', usuario.id);
      
      // Si hay roles para asignar, crearlos en una transacción separada
      if (body.roles && body.roles.length > 0) {
        console.log('Asignando roles:', body.roles);
        
        await db.usuarios_roles.createMany({
          data: body.roles.map((rolId: number) => ({
            usuario_id: usuario.id,
            rol_id: rolId,
            created_at: new Date(),
            updated_at: new Date()
          }))
        });
        
        console.log('Roles asignados correctamente');
      }
      
      // Obtener el usuario completo con roles
      const usuarioCompleto = await db.usuarios.findUnique({
        where: { id: usuario.id },
        include: {
          usuarios_roles: {
            include: {
              roles: {
                include: {
                  roles_permisos: {
                    include: {
                      permisos: true
                    }
                  }
                }
              }
            }
          }
        }
      });
      
      if (!usuarioCompleto) {
        throw new Error('No se pudo recuperar el usuario creado');
      }
      
      console.log('Usuario creado exitosamente:', usuario.id);
      
      // Mapear la respuesta para el frontend
      const usuarioMapeado = {
        ...usuarioCompleto,
        apellidoPaterno: usuarioCompleto.apellido_paterno,
        apellidoMaterno: usuarioCompleto.apellido_materno,
        createdAt: usuarioCompleto.created_at,
        updatedAt: usuarioCompleto.updated_at,
        usuarioRoles: usuarioCompleto.usuarios_roles?.map((ur: any) => ({
          ...ur,
          usuarioId: ur.usuario_id,
          rolId: ur.rol_id,
          createdAt: ur.created_at,
          updatedAt: ur.updated_at,
          rol: ur.roles
        }))
      };
      
      return NextResponse.json(usuarioMapeado);
    } catch (dbError) {
      console.error('Error al crear usuario en la base de datos:', dbError);
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Código de error Prisma:', dbError.code);
        console.error('Mensaje de error Prisma:', dbError.message);
        console.error('Meta datos del error:', dbError.meta);
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
      return NextResponse.json(
        { error: 'Error al crear usuario', details: dbError instanceof Error ? dbError.message : 'Error desconocido' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error general al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
} 