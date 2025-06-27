import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es ADMINISTRADOR, permitir crear clientes para cualquier punto
    if (session.user.role === 'ADMINISTRADOR') {
      const body = await request.json();
      
      const cliente = await prisma.cliente.create({
        data: {
          nombre: body.nombre,
          apellidoPaterno: body.apellidoPaterno,
          apellidoMaterno: body.apellidoMaterno || null,
          email: body.email,
          telefonoCelular: body.telefono,
          puntoRecoleccion: body.puntoRecoleccionId ? {
            connect: {
              id: body.puntoRecoleccionId
            }
          } : undefined
        }
      });

      return NextResponse.json(cliente);
    }

    // Para otros roles, usar el punto de recolección del usuario
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Crear el cliente
    const cliente = await prisma.cliente.create({
      data: {
        nombre: body.nombre,
        apellidoPaterno: body.apellidoPaterno,
        apellidoMaterno: body.apellidoMaterno || null,
        email: body.email,
        telefonoCelular: body.telefono,
        puntoRecoleccion: {
          connect: {
            id: userPointId
          }
        }
      }
    });

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Si es ADMINISTRADOR, mostrar todos los clientes
    if (session.user.role === 'ADMINISTRADOR') {
      const clientes = await prisma.cliente.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });

      return NextResponse.json(clientes);
    }

    // Para otros roles, mostrar solo clientes del punto de recolección
    const userPointId = session.user.puntoRecoleccion?.id;
    
    if (!userPointId) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener los clientes del punto de recolección
    const clientes = await prisma.cliente.findMany({
      where: {
        puntoRecoleccionId: userPointId
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    return NextResponse.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    );
  }
} 