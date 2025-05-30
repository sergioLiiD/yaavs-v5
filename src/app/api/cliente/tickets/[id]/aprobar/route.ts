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
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        Presupuesto: true
      }
    });

    console.log('Ticket encontrado:', ticket);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    if (!ticket.Presupuesto) {
      return NextResponse.json(
        { error: 'El ticket no tiene presupuesto' },
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

    // Verificar el estado actual
    const estatusActual = await prisma.estatusReparacion.findUnique({
      where: {
        id: ticket.estatusReparacionId
      }
    });

    if (!estatusActual || estatusActual.nombre !== 'Presupuesto Generado') {
      return NextResponse.json(
        { error: 'El ticket no está en estado de presupuesto generado' },
        { status: 400 }
      );
    }

    // Actualizar el ticket y el presupuesto
    const ticketActualizado = await prisma.ticket.update({
      where: {
        id: parseInt(params.id)
      },
      data: {
        estatusReparacionId: estatusAprobado.id,
        Presupuesto: {
          update: {
            aprobado: true,
            fechaAprobacion: new Date()
          }
        }
      },
      include: {
        Presupuesto: true
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