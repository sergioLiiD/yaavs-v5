import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener el ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: parseInt(params.id),
        clienteId: Number(session.user.id)
      },
      include: {
        estatusReparacion: true,
        presupuesto: true
      }
    });

    console.log('Ticket encontrado:', ticket);
    console.log('Estado actual:', ticket?.estatusReparacion);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (!ticket.presupuesto) {
      return NextResponse.json(
        { error: 'El ticket no tiene presupuesto' },
        { status: 400 }
      );
    }

    console.log('Estado del ticket:', ticket.estatusReparacion.nombre);

    if (ticket.estatusReparacion.nombre !== 'Presupuesto Generado') {
      return NextResponse.json(
        { error: 'El ticket no está en estado de presupuesto generado' },
        { status: 400 }
      );
    }

    // Buscar el estado "Presupuesto Aprobado"
    const estatusAprobado = await prisma.estatusReparacion.findFirst({
      where: {
        nombre: 'Presupuesto Aprobado'
      }
    });

    if (!estatusAprobado) {
      return NextResponse.json(
        { error: 'Estado "Presupuesto Aprobado" no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar el ticket y el presupuesto
    const ticketActualizado = await prisma.ticket.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        estatusReparacionId: estatusAprobado.id,
        presupuesto: {
          update: {
            aprobado: true,
            fechaAprobacion: new Date()
          }
        }
      },
      include: {
        cliente: true,
        tipoServicio: true,
        modelo: {
          include: {
            marca: true,
          },
        },
        estatusReparacion: true,
        tecnicoAsignado: true,
        dispositivo: true,
        direccion: true,
        presupuesto: true,
        pagos: {
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    return NextResponse.json(ticketActualizado);
  } catch (error) {
    console.error('Error al aprobar presupuesto:', error);
    return NextResponse.json(
      { error: 'Error al aprobar presupuesto' },
      { status: 500 }
    );
  }
} 