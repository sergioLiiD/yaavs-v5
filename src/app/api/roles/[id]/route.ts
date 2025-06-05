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
    const { nombre, descripcion, permisos } = body;

    console.log('Datos recibidos:', { nombre, descripcion, permisos });

    if (!nombre || !descripcion) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (!Array.isArray(permisos)) {
      return NextResponse.json(
        { error: 'El campo permisos debe ser un array' },
        { status: 400 }
      );
    }

    // Verificar que todos los permisos existan
    const permisosExistentes = await prisma.permiso.findMany({
      where: {
        id: {
          in: permisos
        }
      }
    });

    console.log('Permisos existentes:', permisosExistentes);

    if (permisosExistentes.length !== permisos.length) {
      const permisosNoExistentes = permisos.filter(
        id => !permisosExistentes.some(p => p.id === id)
      );
      console.log('Permisos no existentes:', permisosNoExistentes);
      return NextResponse.json(
        { 
          error: 'Uno o más permisos no existen',
          permisosNoExistentes 
        },
        { status: 400 }
      );
    }

    // Primero eliminamos todos los permisos actuales
    await prisma.rolPermiso.deleteMany({
      where: {
        rolId: parseInt(params.id)
      }
    });

    // Luego actualizamos el rol y creamos los nuevos permisos
    const rol = await prisma.rol.update({
      where: {
        id: parseInt(params.id)
      },
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

    const rolFormateado = {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      activo: rol.activo,
      permisos: rol.permisos.map((rp) => ({
        id: rp.permiso.id,
        codigo: rp.permiso.codigo,
        nombre: rp.permiso.nombre
      }))
    };

    return NextResponse.json(rolFormateado);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
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

    // Primero eliminamos los permisos asociados
    await prisma.rolPermiso.deleteMany({
      where: {
        rolId: parseInt(params.id)
      }
    });

    // Luego eliminamos los roles de usuario asociados
    await prisma.usuarioRol.deleteMany({
      where: {
        rolId: parseInt(params.id)
      }
    });

    // Finalmente eliminamos el rol
    await prisma.rol.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 