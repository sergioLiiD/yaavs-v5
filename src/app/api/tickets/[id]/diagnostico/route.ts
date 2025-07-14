import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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

    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        reparaciones: true
      }
    });

    if (!ticket) {
      console.log('GET /diagnostico - Ticket no encontrado:', ticketId);
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    console.log('GET /diagnostico - Datos de reparación:', ticket.reparaciones);

    // En GET
    const reparacion = Array.isArray(ticket.reparaciones) ? ticket.reparaciones[0] : ticket.reparaciones;

    return NextResponse.json({
      success: true,
      diagnostico: reparacion?.diagnostico || '',
      versionSO: reparacion?.version_so || '',
      saludBateria: reparacion?.salud_bateria || 0
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
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        reparaciones: true
      }
    });

    if (!ticket) {
      console.log('POST /diagnostico - Ticket no encontrado:', ticketId);
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // En POST
    let reparacion = Array.isArray(ticket.reparaciones) ? ticket.reparaciones[0] : ticket.reparaciones;
    console.log('POST /diagnostico - Reparación actual:', reparacion);

    // Si no existe la reparación, crearla
    if (!reparacion) {
      console.log('POST /diagnostico - Creando nueva reparación');
      reparacion = await prisma.reparaciones.create({
        data: {
          ticket_id: ticketId,
          fecha_inicio: new Date(),
          diagnostico: diagnostico || '',
          version_so: versionSO || '',
          salud_bateria: saludBateria ? Number(saludBateria) : 0,
          updated_at: new Date()
        }
      });
    } else {
      // Si existe, actualizar solo los campos específicos
      console.log('POST /diagnostico - Actualizando reparación existente');
      reparacion = await prisma.reparaciones.update({
        where: { id: reparacion.id },
        data: {
          diagnostico: diagnostico !== undefined ? diagnostico : reparacion.diagnostico,
          version_so: versionSO || '',
          salud_bateria: saludBateria ? Number(saludBateria) : 0
        }
      });
    }

    console.log('POST /diagnostico - Reparación guardada:', reparacion);

    return NextResponse.json({
      success: true,
      diagnostico: reparacion.diagnostico,
      versionSO: reparacion.version_so,
      saludBateria: reparacion.salud_bateria
    });

  } catch (error) {
    console.error('Error al guardar el diagnóstico:', error);
    return NextResponse.json(
      { error: 'Error al guardar el diagnóstico' },
      { status: 500 }
    );
  }
} 