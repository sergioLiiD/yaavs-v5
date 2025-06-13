import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
      const roles = await prisma.rol.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          permisos: {
            select: {
              permiso: {
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
        permisos: rol.permisos.map(p => ({
          id: p.permiso.id,
          nombre: p.permiso.nombre,
          descripcion: p.permiso.descripcion
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

    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const rol = await prisma.rol.create({
      data: {
        nombre,
        descripcion,
        permisos: {
          create: permisos.map((permisoId: number) => ({
            permiso: {
              connect: { id: permisoId }
            }
          }))
        }
      },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    return NextResponse.json(rol);
  } catch (error) {
    console.error('Error al crear rol:', error);
    return NextResponse.json(
      { error: 'Error al crear rol' },
      { status: 500 }
    );
  }
} 