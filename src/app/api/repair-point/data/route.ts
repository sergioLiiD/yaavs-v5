import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de reparación del usuario
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntoRecoleccion) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Obtener clientes
    const clientes = await prisma.$queryRaw`
      SELECT id, nombre, apellido_paterno as "apellidoPaterno", apellido_materno as "apellidoMaterno"
      FROM clientes
      WHERE punto_recoleccion_id = ${userPoint.puntoRecoleccion.id}
      ORDER BY nombre ASC
    `;

    // Obtener modelos
    const modelos = await prisma.modelo.findMany({
      select: {
        id: true,
        nombre: true,
        marca: {
          select: {
            id: true,
            nombre: true
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Obtener estatus de reparación
    const estatusReparacion = await prisma.estatusReparacion.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombre: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json({
      puntoRecoleccion: userPoint.puntoRecoleccion,
      clientes,
      modelos,
      estatusReparacion
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos' },
      { status: 500 }
    );
  }
} 