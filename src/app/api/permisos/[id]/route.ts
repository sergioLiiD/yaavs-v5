import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
        ],
        NOT: {
          id: parseInt(params.id)
        }
      }
    });

    if (permisoExistente) {
      return new NextResponse('Ya existe un permiso con ese nombre o código', { status: 400 });
    }

    const permiso = await prisma.permiso.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        nombre,
        descripcion,
        codigo
      }
    });

    return NextResponse.json(permiso);
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    if (session.user.role !== 'ADMINISTRADOR') {
      return new NextResponse('No autorizado', { status: 403 });
    }

    // Verificar si el permiso está siendo usado por algún rol
    const permisoEnUso = await prisma.rolPermiso.findFirst({
      where: {
        permisoId: parseInt(params.id)
      }
    });

    if (permisoEnUso) {
      return new NextResponse('No se puede eliminar el permiso porque está siendo usado por uno o más roles', { status: 400 });
    }

    await prisma.permiso.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 