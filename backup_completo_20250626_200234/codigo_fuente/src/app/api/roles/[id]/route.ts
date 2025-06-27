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

    const { nombre, descripcion, permisos } = await request.json();
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

    // Validar que los permisos sean un array de números
    const permisosFiltrados = permisos.filter((id: any) => typeof id === 'number');
    console.log('Permisos filtrados:', permisosFiltrados);

    // Verificar que todos los permisos existan
    const permisosExistentes = await prisma.permiso.findMany({
      where: {
        id: {
          in: permisosFiltrados
        }
      }
    });

    console.log('Permisos existentes:', permisosExistentes);

    if (permisosExistentes.length !== permisosFiltrados.length) {
      const permisosNoExistentes = permisosFiltrados.filter(
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
    console.log('Eliminando permisos actuales...');
    await prisma.rolPermiso.deleteMany({
      where: {
        rolId: parseInt(params.id)
      }
    });

    // Luego actualizamos el rol y creamos los nuevos permisos
    console.log('Actualizando rol y creando nuevos permisos...');
    const rol = await prisma.rol.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        nombre,
        descripcion,
        permisos: {
          create: permisosFiltrados.map((permisoId: number) => ({
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

    console.log('Rol actualizado:', rol);

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

    console.log('Rol formateado para respuesta:', rolFormateado);
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