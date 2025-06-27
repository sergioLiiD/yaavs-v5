import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('Iniciando GET /api/permisos');
    
    const session = await getServerSession(authOptions);
    console.log('Sesión:', session ? 'Autenticado' : 'No autenticado');
    
    if (!session) {
      console.log('Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario es administrador o tiene el permiso PERMISSIONS_VIEW
    if (session.user.role !== 'ADMINISTRADOR' && !session.user.permissions.includes('PERMISSIONS_VIEW')) {
      console.log('Usuario no tiene permisos');
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    try {
      const permisos = await prisma.permisos.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });

      console.log('Permisos encontrados:', permisos);
      return NextResponse.json(permisos);
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
    console.error('Error al obtener permisos:', error);
    return NextResponse.json(
      { error: 'Error al obtener permisos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    if (session.user.role !== 'ADMINISTRADOR') {
      return new NextResponse('No autorizado', { status: 403 });
    }

    const body = await request.json();
    const { nombre, descripcion, codigo, categoria } = body;

    if (!nombre || !descripcion || !codigo || !categoria) {
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    const permisoExistente = await prisma.permisos.findFirst({
      where: {
        OR: [
          { nombre },
          { codigo }
        ]
      }
    });

    if (permisoExistente) {
      return new NextResponse('Ya existe un permiso con ese nombre o código', { status: 400 });
    }

    const permiso = await prisma.permisos.create({
      data: {
        nombre,
        descripcion,
        codigo,
        categoria,
        updated_at: new Date()
      }
    });

    return NextResponse.json(permiso);
  } catch (error) {
    console.error('Error al crear permiso:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 