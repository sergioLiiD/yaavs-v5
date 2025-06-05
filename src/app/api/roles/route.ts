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

    const roles = await prisma.rol.findMany({
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    // Formatear la respuesta para incluir los permisos de manera más clara
    const rolesFormateados = roles.map(rol => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      activo: rol.activo,
      permisos: rol.permisos.map(rp => ({
        id: rp.permiso.id,
        codigo: rp.permiso.codigo,
        nombre: rp.permiso.nombre
      }))
    }));

    return NextResponse.json(rolesFormateados);
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