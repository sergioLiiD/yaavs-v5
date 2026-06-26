import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  assertAdmin,
  parseTicketRecuperadoBody,
  ticketRecuperadoBodySchema,
} from '@/lib/tickets-recuperados-api';
import {
  ticketRecuperadoListInclude,
  updateTicketRecuperado,
} from '@/lib/tickets-recuperados';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const denied = assertAdmin(session);
    if (denied) return denied;

    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const ticket = await prisma.tickets.findUnique({
      where: { id },
      include: ticketRecuperadoListInclude,
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    const isRecuperado =
      ticket.recuperacion_manual || ticket.clientes?.tipo_registro === 'recuperacion_manual';

    if (!isRecuperado) {
      return NextResponse.json({ error: 'No es un ticket de recuperación' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error obteniendo ticket recuperado:', error);
    return NextResponse.json({ error: 'Error al obtener ticket' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const denied = assertAdmin(session);
    if (denied) return denied;

    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const json = await request.json();
    const parsed = ticketRecuperadoBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await updateTicketRecuperado(prisma, id, parseTicketRecuperadoBody(parsed.data));

    const full = await prisma.tickets.findUnique({
      where: { id },
      include: ticketRecuperadoListInclude,
    });

    return NextResponse.json(full);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al actualizar ticket';
    console.error('Error actualizando ticket recuperado:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
