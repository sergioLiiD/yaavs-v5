import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const body = await request.json();
    console.log('Datos recibidos para entrega:', body);

    // Verificar que el ticket existe y está en estado de reparación completada
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        entregas: {
          include: {
            direcciones: true
          }
        },
        direcciones: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    // Obtener el estatus de reparación
    const estatusReparacion = await prisma.estatusReparacion.findUnique({
      where: { id: ticket.estatusReparacionId }
    });

    if (!estatusReparacion) {
      return NextResponse.json(
        { error: 'No se encontró el estatus de reparación' },
        { status: 404 }
      );
    }

    // Verificar que el ticket está en estado de reparación completada
    if (estatusReparacion.nombre !== 'Reparación Completada') {
      return NextResponse.json(
        { error: 'El ticket debe estar en estado de reparación completada' },
        { status: 400 }
      );
    }

    // Determinar el tipo de entrega basado en el creador del ticket
    const tipoEntrega = ticket.creadorId === ticket.clienteId ? 'DOMICILIO' : 'OFICINA';

    // Buscar el estado "En Entrega"
    const estatusEntrega = await prisma.estatusReparacion.findFirst({
      where: {
        nombre: 'En Entrega'
      }
    });

    if (!estatusEntrega) {
      return NextResponse.json(
        { error: 'Estado "En Entrega" no encontrado' },
        { status: 404 }
      );
    }

    // Obtener la dirección del ticket
    const direccion = await prisma.direcciones.findUnique({
      where: { id: ticket.direccionId || 0 }
    });

    // Crear o actualizar la entrega
    const entrega = await prisma.entregas.upsert({
      where: {
        ticketId: ticketId
      },
      create: {
        tickets: { connect: { id: ticketId } },
        tipoEntrega: tipoEntrega as 'DOMICILIO' | 'OFICINA',
        observaciones: body.observaciones,
        updatedAt: new Date(),
        direcciones: tipoEntrega === 'DOMICILIO' && direccion ? {
          create: {
            calle: direccion.calle,
            numeroExterior: direccion.numeroExterior,
            numeroInterior: direccion.numeroInterior || '',
            colonia: direccion.colonia,
            ciudad: direccion.ciudad,
            estado: direccion.estado,
            codigoPostal: direccion.codigoPostal,
            latitud: direccion.latitud || 0,
            longitud: direccion.longitud || 0,
            updatedAt: new Date()
          }
        } : undefined
      },
      update: {
        observaciones: body.observaciones,
        updatedAt: new Date(),
        direcciones: tipoEntrega === 'DOMICILIO' && direccion ? {
          update: {
            calle: direccion.calle,
            numeroExterior: direccion.numeroExterior,
            numeroInterior: direccion.numeroInterior || '',
            colonia: direccion.colonia,
            ciudad: direccion.ciudad,
            estado: direccion.estado,
            codigoPostal: direccion.codigoPostal,
            latitud: direccion.latitud || 0,
            longitud: direccion.longitud || 0,
            updatedAt: new Date()
          }
        } : undefined
      }
    });

    // Actualizar el estado del ticket
    const ticketActualizado = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        estatusReparacionId: estatusEntrega.id
      },
      include: {
        entregas: {
          include: {
            direcciones: true
          }
        }
      }
    });

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error al procesar la entrega:', error);
    return NextResponse.json(
      { error: 'Error al procesar la entrega' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const body = await request.json();
    console.log('Datos recibidos para actualizar entrega:', body);

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        entregas: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    if (!ticket.entregas) {
      return NextResponse.json({ error: 'No hay entrega registrada' }, { status: 404 });
    }

    // Buscar el estado "Entregado"
    const estatusEntregado = await prisma.estatusReparacion.findFirst({
      where: {
        nombre: 'Entregado'
      }
    });

    if (!estatusEntregado) {
      return NextResponse.json(
        { error: 'Estado "Entregado" no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar la entrega
    const entregaActualizada = await prisma.entregas.update({
      where: {
        ticketId: ticketId
      },
      data: {
        entregado: true,
        fechaEntrega: new Date(),
        observaciones: body.observaciones
      }
    });

    // Actualizar el estado del ticket
    const ticketActualizado = await prisma.ticket.update({
      where: {
        id: ticketId
      },
      data: {
        estatusReparacionId: estatusEntregado.id,
        entregado: true,
        fechaEntrega: new Date()
      },
      include: {
        entregas: {
          include: {
            direcciones: true
          }
        }
      }
    });

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error al actualizar la entrega:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la entrega' },
      { status: 500 }
    );
  }
} 