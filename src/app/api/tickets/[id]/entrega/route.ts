import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        estatusReparacion: true,
        entrega: true,
        direccion: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    // Verificar que el ticket está en estado de reparación completada
    if (ticket.estatusReparacion.nombre !== 'Reparación Completada') {
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

    // Crear o actualizar la entrega
    const entrega = await prisma.entrega.upsert({
      where: {
        ticketId: ticketId
      },
      create: {
        ticketId: ticketId,
        tipoEntrega: tipoEntrega,
        observaciones: body.observaciones,
        direccionEntrega: tipoEntrega === 'DOMICILIO' ? {
          create: {
            calle: ticket.direccion?.calle || '',
            numeroExterior: ticket.direccion?.numeroExterior || '',
            numeroInterior: ticket.direccion?.numeroInterior || '',
            colonia: ticket.direccion?.colonia || '',
            ciudad: ticket.direccion?.ciudad || '',
            estado: ticket.direccion?.estado || '',
            codigoPostal: ticket.direccion?.codigoPostal || '',
            latitud: ticket.direccion?.latitud || 0,
            longitud: ticket.direccion?.longitud || 0
          }
        } : undefined
      },
      update: {
        observaciones: body.observaciones,
        direccionEntrega: tipoEntrega === 'DOMICILIO' ? {
          update: {
            calle: ticket.direccion?.calle || '',
            numeroExterior: ticket.direccion?.numeroExterior || '',
            numeroInterior: ticket.direccion?.numeroInterior || '',
            colonia: ticket.direccion?.colonia || '',
            ciudad: ticket.direccion?.ciudad || '',
            estado: ticket.direccion?.estado || '',
            codigoPostal: ticket.direccion?.codigoPostal || '',
            latitud: ticket.direccion?.latitud || 0,
            longitud: ticket.direccion?.longitud || 0
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
        estatusReparacion: true,
        entrega: {
          include: {
            direccionEntrega: true
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
        entrega: true
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    if (!ticket.entrega) {
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
    const entregaActualizada = await prisma.entrega.update({
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
        estatusReparacion: true,
        entrega: {
          include: {
            direccionEntrega: true
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