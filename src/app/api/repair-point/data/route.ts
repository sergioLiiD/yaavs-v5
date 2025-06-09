import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

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
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint || !userPoint.puntos_recoleccion.isRepairPoint) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para punto de reparación' },
        { status: 403 }
      );
    }

    // Obtener clientes
    const clientes = await prisma.cliente.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Obtener modelos
    const modelos = await prisma.modelo.findMany({
      where: {
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        marcas: {
          select: {
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