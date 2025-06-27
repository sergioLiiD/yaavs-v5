import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    console.log('GET /diagnostico - Obteniendo diagnóstico para ticket:', ticketId);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      console.log('GET /diagnostico - Ticket no encontrado:', ticketId);
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    console.log('GET /diagnostico - Datos de reparación:', ticket.reparacion);

    return NextResponse.json({
      success: true,
      diagnostico: ticket.reparacion?.diagnostico || '',
      versionSO: ticket.reparacion?.versionSO || '',
      saludBateria: ticket.reparacion?.saludBateria || 0
    });

  } catch (error) {
    console.error('Error al obtener el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al obtener el diagnóstico' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const ticketId = parseInt(params.id);
    const body = await request.json();
    console.log('POST /diagnostico - Datos recibidos:', body);
    
    const { diagnostico, versionSO, saludBateria } = body;

    // Obtener el ticket con su reparación
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reparacion: true
      }
    });

    if (!ticket) {
      console.log('POST /diagnostico - Ticket no encontrado:', ticketId);
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    let reparacion = ticket.reparacion;
    console.log('POST /diagnostico - Reparación actual:', reparacion);

    // Si no existe la reparación, crearla
    if (!reparacion) {
      console.log('POST /diagnostico - Creando nueva reparación');
      reparacion = await prisma.reparacion.create({
        data: {
          ticketId,
          fechaInicio: new Date(),
          diagnostico: diagnostico || '',
          versionSO: versionSO || '',
          saludBateria: saludBateria ? Number(saludBateria) : 0
        }
      });
    } else {
      // Si existe, actualizar solo los campos específicos
      console.log('POST /diagnostico - Actualizando reparación existente');
      reparacion = await prisma.reparacion.update({
        where: { id: reparacion.id },
        data: {
          diagnostico: diagnostico !== undefined ? diagnostico : reparacion.diagnostico,
          versionSO: versionSO || '',
          saludBateria: saludBateria ? Number(saludBateria) : 0
        }
      });
    }

    console.log('POST /diagnostico - Reparación guardada:', reparacion);

    return NextResponse.json({
      success: true,
      diagnostico: reparacion.diagnostico,
      versionSO: reparacion.versionSO,
      saludBateria: reparacion.saludBateria
    });

  } catch (error) {
    console.error('Error al guardar el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al guardar el diagnóstico' },
      { status: 500 }
    );
  }
} 