import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
    const permisosExistentes = await prisma.permisos.findMany({
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
    await prisma.roles_permisos.deleteMany({
      where: {
        rol_id: parseInt(params.id)
      }
    });

    // Luego actualizamos el rol
    console.log('Actualizando rol...');
    const rol = await prisma.roles.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        nombre,
        descripcion,
        updated_at: new Date()
      }
    });

    // Crear los nuevos permisos
    console.log('Creando nuevos permisos...');
    for (const permisoId of permisosFiltrados) {
      await prisma.roles_permisos.create({
        data: {
          rol_id: parseInt(params.id),
          permiso_id: permisoId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Obtener el rol con sus permisos
    const rolCompleto = await prisma.roles.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        roles_permisos: {
          include: {
            permisos: true
          }
        }
      }
    });

    console.log('Rol actualizado:', rolCompleto);

    const rolFormateado = {
      id: rolCompleto!.id,
      nombre: rolCompleto!.nombre,
      descripcion: rolCompleto!.descripcion,
      permisos: rolCompleto!.roles_permisos.map((rp) => ({
        id: rp.permisos.id,
        codigo: rp.permisos.codigo,
        nombre: rp.permisos.nombre
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
    await prisma.roles_permisos.deleteMany({
      where: {
        rol_id: parseInt(params.id)
      }
    });

    // Luego eliminamos los roles de usuario asociados
    await prisma.usuarios_roles.deleteMany({
      where: {
        rol_id: parseInt(params.id)
      }
    });

    // Finalmente eliminamos el rol
    await prisma.roles.delete({
      where: {
        id: parseInt(params.id)
      }
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 