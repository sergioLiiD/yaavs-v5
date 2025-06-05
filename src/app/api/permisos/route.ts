import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const permisos = await prisma.permiso.findMany({
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(permisos);
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
    const { nombre, descripcion, codigo } = body;

    if (!nombre || !descripcion || !codigo) {
      return new NextResponse('Faltan campos requeridos', { status: 400 });
    }

    const permisoExistente = await prisma.permiso.findFirst({
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

    const permiso = await prisma.permiso.create({
      data: {
        nombre,
        descripcion,
        codigo
      }
    });

    return NextResponse.json(permiso);
  } catch (error) {
    console.error('Error al crear permiso:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 