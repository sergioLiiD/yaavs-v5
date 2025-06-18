import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
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

    // Si es ADMINISTRADOR, permitir acceso a todos los datos
    if (session.user.role === 'ADMINISTRADOR') {
      const clientes = await prisma.cliente.findMany({
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
        puntoRecoleccion: null, // No hay punto específico para administradores
        clientes,
        modelos,
        estatusReparacion
      });
    }

    // Para otros roles, usar el punto de recolección de la sesión
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener el punto de recolección
    const puntoRecoleccion = await prisma.puntoRecoleccion.findUnique({
      where: { id: userPointId }
    });

    if (!puntoRecoleccion) {
      return NextResponse.json(
        { error: 'Punto de recolección no encontrado' },
        { status: 404 }
      );
    }

    // Obtener clientes del punto de recolección
    const clientes = await prisma.cliente.findMany({
      where: {
        puntoRecoleccionId: userPointId
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
      puntoRecoleccion,
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