import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('Iniciando GET /api/roles');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario es administrador o tiene el permiso ROLES_VIEW
    if (session.user.role !== 'ADMINISTRADOR' && !session.user.permissions.includes('ROLES_VIEW')) {
      console.log('Usuario no tiene permisos');
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
      const roles = await prisma.roles.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          roles_permisos: {
            select: {
              permisos: {
                select: {
                  id: true,
                  nombre: true,
                  descripcion: true
                }
              }
            }
          }
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      // Log detallado de la estructura
      console.log('Roles encontrados (detalle):', JSON.stringify(roles, null, 2));

      // Formatear la respuesta para asegurar la estructura correcta
      const rolesFormateados = roles.map(rol => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.roles_permisos.map(p => ({
          id: p.permisos.id,
          nombre: p.permisos.nombre,
          descripcion: p.permisos.descripcion
        }))
      }));

      console.log('Roles formateados:', JSON.stringify(rolesFormateados, null, 2));
      return NextResponse.json(rolesFormateados);
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
    console.error('Error al obtener roles:', error);
    return NextResponse.json(
      { error: 'Error al obtener roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { nombre, descripcion, permisos } = await request.json();

    console.log('Datos recibidos:', { nombre, descripcion, permisos });

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el rol ya existe
    const rolExistente = await prisma.roles.findUnique({
      where: {
        nombre: nombre
      }
    });

    if (rolExistente) {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese nombre' },
        { status: 400 }
      );
    }

    // Validar que los permisos existan
    if (permisos && Array.isArray(permisos) && permisos.length > 0) {
      const permisosExistentes = await prisma.permisos.findMany({
        where: {
          id: {
            in: permisos
          }
        },
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      });

      console.log('Permisos encontrados:', permisosExistentes);

      if (permisosExistentes.length !== permisos.length) {
        const permisosEncontrados = permisosExistentes.map(p => p.id);
        const permisosNoEncontrados = permisos.filter(id => !permisosEncontrados.includes(id));
        
        return NextResponse.json(
          { 
            error: 'Algunos permisos no existen',
            permisosNoEncontrados,
            permisosEncontrados
          },
          { status: 400 }
        );
      }
    }

    const rol = await prisma.roles.create({
      data: {
        nombre,
        descripcion,
        updated_at: new Date(),
        roles_permisos: {
          create: permisos.map((permisoId: number) => ({
            permiso_id: permisoId
          }))
        }
      },
      include: {
        roles_permisos: {
          include: {
            permisos: true
          }
        }
      }
    });

    return NextResponse.json(rol);
  } catch (error) {
    console.error('Error al crear rol:', error);
    
    // Log detallado del error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error de Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return NextResponse.json(
        { 
          error: 'Error de base de datos al crear rol',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear rol',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 