import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const cliente = await prisma.cliente.findUnique({
      where: {
        id: Number(session.user.id),
      },
      include: {
        direcciones: true,
      },
    });

    const tickets = await prisma.ticket.findMany({
      where: {
        clienteId: Number(session.user.id),
      },
      include: {
        estatusReparacion: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    const reparaciones = await prisma.ticket.findMany({
      where: {
        clienteId: Number(session.user.id),
        estatusReparacion: {
          nombre: 'En Reparación',
        },
      },
      include: {
        modelo: {
          include: {
            marca: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    });

    return NextResponse.json({
      cliente,
      tickets,
      reparaciones,
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
} 