import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface EntregaPayload {
  observaciones: string;
  checklist: Array<{
    id: number;
    item: string;
    respuesta: boolean;
    observacion: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const body: EntregaPayload = await request.json();

    // Verificar que el ticket existe
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      return new NextResponse('Ticket no encontrado', { status: 404 });
    }

    // Actualizar la reparación con la fecha de fin y observaciones
    const reparacion = await prisma.reparacion.update({
      where: { ticketId },
      data: {
        fechaFin: new Date(),
        observaciones: body.observaciones
      }
    });

    // Actualizar el estado del ticket a "Entregado"
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        estatusReparacionId: 8, // 8 = Entregado
        fechaEntrega: new Date()
      }
    });

    // Guardar el checklist de entrega
    if (body.checklist && body.checklist.length > 0) {
      for (const item of body.checklist) {
        await prisma.checklistItem.create({
          data: {
            nombre: item.item,
            descripcion: item.observacion || '',
            paraDiagnostico: false,
            paraReparacion: true,
            checklistDiagnosticoId: reparacion.id
          }
        });
      }
    }

    return NextResponse.json(reparacion);
  } catch (error) {
    console.error('Error al registrar la entrega:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
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