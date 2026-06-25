import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWorkflowStatus, loadTicketWorkflowContext } from '@/lib/ticket-workflow';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const ticketId = parseInt(params.id);
    const ticket = await loadTicketWorkflowContext(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    const excepcionesRaw = await prisma.excepciones_flujo.findMany({
      where: { ticket_id: ticketId },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            apellido_paterno: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const excepciones = excepcionesRaw.map((e) => ({
      id: e.id,
      tipo: e.tipo,
      razon: e.razon,
      createdAt: e.created_at.toISOString(),
      usuario: {
        id: e.usuarios.id,
        nombre: e.usuarios.nombre,
        apellido_paterno: e.usuarios.apellido_paterno,
      },
    }));

    return NextResponse.json(getWorkflowStatus(ticket, excepciones));
  } catch (error) {
    console.error('Error al obtener estado del flujo:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
