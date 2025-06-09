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

    // Obtener el punto de recolección asociado al usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    // Obtener los tickets asociados al punto de recolección
    const tickets = await prisma.ticket.findMany({
      where: {
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        cancelado: false
      },
      include: {
        cliente: true,
        modelo: true,
        estatusReparacion: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el punto de recolección del usuario
    const userPoint = await prisma.usuarios_puntos_recoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntos_recoleccion: true
      }
    });

    if (!userPoint) {
      return NextResponse.json(
        { error: 'Usuario no asociado a un punto de recolección' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Crear el ticket
    const ticket = await prisma.ticket.create({
      data: {
        ...body,
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        creadorId: session.user.id,
        cancelado: false
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    );
  }
} 