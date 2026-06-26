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
  createTicketRecuperado,
  ticketRecuperadoListInclude,
} from '@/lib/tickets-recuperados';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const denied = assertAdmin(session);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';

    const tickets = await prisma.tickets.findMany({
      where: {
        OR: [
          { recuperacion_manual: true },
          { clientes: { tipo_registro: 'recuperacion_manual' } },
        ],
        ...(search
          ? {
              AND: {
                OR: [
                  { numero_ticket: { contains: search, mode: 'insensitive' } },
                  { descripcion_problema: { contains: search, mode: 'insensitive' } },
                  { clientes: { nombre: { contains: search, mode: 'insensitive' } } },
                  { clientes: { apellido_paterno: { contains: search, mode: 'insensitive' } } },
                ],
              },
            }
          : {}),
      },
      include: ticketRecuperadoListInclude,
      orderBy: { fecha_recepcion: 'desc' },
      take: 200,
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error listando tickets recuperados:', error);
    return NextResponse.json({ error: 'Error al listar tickets recuperados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const denied = assertAdmin(session);
    if (denied) return denied;

    const json = await request.json();
    const parsed = ticketRecuperadoBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const ticket = await createTicketRecuperado(
      prisma,
      parseTicketRecuperadoBody(parsed.data),
      session!.user.id
    );

    const full = await prisma.tickets.findUnique({
      where: { id: ticket.id },
      include: ticketRecuperadoListInclude,
    });

    return NextResponse.json(full, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al crear ticket';
    console.error('Error creando ticket recuperado:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
