import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
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
    const direcciones = await prisma.direcciones.findMany({
      where: {
        cliente_id: cliente.id
      }
    });

    const tickets = await prisma.tickets.findMany({
      where: {
        cliente_id: cliente.id,
      },
      include: {
        estatus_reparacion: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 3,
    });

    const reparaciones = await prisma.tickets.findMany({
      where: {
        cliente_id: cliente.id,
        estatus_reparacion: {
          nombre: 'En Reparación',
        },
      },
      include: {
        modelos: {
          include: {
            marcas: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 3,
    });

    // Mapear los datos a formato camelCase para el frontend
    const ticketsMapeados = tickets.map(ticket => ({
      ...ticket,
      clienteId: ticket.cliente_id,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      estatusReparacion: ticket.estatus_reparacion
    }));

    const reparacionesMapeadas = reparaciones.map(reparacion => ({
      ...reparacion,
      clienteId: reparacion.cliente_id,
      createdAt: reparacion.created_at,
      updatedAt: reparacion.updated_at,
      modelo: reparacion.modelos ? {
        ...reparacion.modelos,
        marcaId: reparacion.modelos.marca_id,
        createdAt: reparacion.modelos.created_at,
        updatedAt: reparacion.modelos.updated_at,
        marca: reparacion.modelos.marcas ? {
          ...reparacion.modelos.marcas,
          createdAt: reparacion.modelos.marcas.created_at,
          updatedAt: reparacion.modelos.marcas.updated_at
        } : null
      } : null
    }));

    const direccionesMapeadas = direcciones.map(direccion => ({
      ...direccion,
      clienteId: direccion.cliente_id,
      numeroExterior: direccion.numero_exterior,
      numeroInterior: direccion.numero_interior,
      codigoPostal: direccion.codigo_postal,
      createdAt: direccion.created_at,
      updatedAt: direccion.updated_at
    }));

    return NextResponse.json({
      cliente: {
        ...cliente,
        direcciones: direccionesMapeadas
      },
      tickets: ticketsMapeados,
      reparaciones: reparacionesMapeadas,
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    );
  }
} 