import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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
      const clientesRaw = await prisma.clientes.findMany({
        select: {
          id: true,
          nombre: true,
          apellido_paterno: true,
          apellido_materno: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      const modelosRaw = await prisma.modelos.findMany({
        select: {
          id: true,
          nombre: true,
          marcas: {
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

      const estatusReparacionRaw = await prisma.estatus_reparacion.findMany({
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

      // Mapear a formato camelCase para el frontend
      const clientes = clientesRaw.map(cliente => ({
        id: cliente.id,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellido_paterno,
        apellidoMaterno: cliente.apellido_materno
      }));

      const modelos = modelosRaw.map(modelo => ({
        id: modelo.id,
        nombre: modelo.nombre,
        marca: modelo.marcas ? {
          id: modelo.marcas.id,
          nombre: modelo.marcas.nombre
        } : null
      }));

      const estatusReparacion = estatusReparacionRaw.map(estatus => ({
        id: estatus.id,
        nombre: estatus.nombre
      }));

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
    const puntoRecoleccion = await prisma.puntos_recoleccion.findUnique({
      where: { id: userPointId }
    });

    if (!puntoRecoleccion) {
      return NextResponse.json(
        { error: 'Punto de recolección no encontrado' },
        { status: 404 }
      );
    }

    // Obtener clientes del punto de recolección
    const clientesRaw = await prisma.clientes.findMany({
      where: {
        punto_recoleccion_id: userPointId
      },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    // Obtener modelos
    const modelosRaw = await prisma.modelos.findMany({
      select: {
        id: true,
        nombre: true,
        marcas: {
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
    const estatusReparacionRaw = await prisma.estatus_reparacion.findMany({
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

    // Mapear a formato camelCase para el frontend
    const clientes = clientesRaw.map(cliente => ({
      id: cliente.id,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellido_paterno,
      apellidoMaterno: cliente.apellido_materno
    }));

    const modelos = modelosRaw.map(modelo => ({
      id: modelo.id,
      nombre: modelo.nombre,
      marca: modelo.marcas ? {
        id: modelo.marcas.id,
        nombre: modelo.marcas.nombre
      } : null
    }));

    const estatusReparacion = estatusReparacionRaw.map(estatus => ({
      id: estatus.id,
      nombre: estatus.nombre
    }));

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