import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { ClienteService } from '@/services/clienteService';
import prisma from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('cliente_token');

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const cliente = await ClienteService.findById(decoded.id);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener las direcciones del cliente
    const direcciones = await prisma.direccion.findMany({
      where: {
        clienteId: cliente.id
      }
    });

    const tickets = await prisma.ticket.findMany({
      where: {
        clienteId: cliente.id,
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
        clienteId: cliente.id,
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
      cliente: {
        ...cliente,
        direcciones
      },
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