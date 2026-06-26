import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

function assertAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  if (session.user.role !== 'ADMINISTRADOR') {
    return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  }
  return null;
}

const pagoSchema = z.object({
  metodoPago: z.enum(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA']),
  monto: z.number().positive(),
  referencia: z.string().optional().nullable(),
});

export const ticketRecuperadoBodySchema = z.object({
  numeroTicket: z.string().min(1),
  clienteId: z.number().int().positive(),
  tipoServicioId: z.number().int().positive(),
  modeloId: z.number().int().positive(),
  descripcionProblema: z.string().min(1),
  fechaRecepcion: z.string().min(1),
  entregado: z.boolean(),
  fechaEntrega: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  capacidad: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  fechaCompra: z.string().optional().nullable(),
  tipoDesbloqueo: z.enum(['pin', 'patron']).optional().nullable(),
  codigoDesbloqueo: z.string().optional().nullable(),
  redCelular: z.string().optional().nullable(),
  puntoRecoleccionId: z.number().int().positive().optional().nullable(),
  presupuestoTotal: z.number().nonnegative().optional().nullable(),
  saldo: z.number().nonnegative().optional().nullable(),
  pagos: z.array(pagoSchema).optional(),
  notasEntrega: z.string().optional().nullable(),
  entregadoPorTexto: z.string().optional().nullable(),
});

export type TicketRecuperadoBody = z.infer<typeof ticketRecuperadoBodySchema>;

export function parseTicketRecuperadoBody(body: TicketRecuperadoBody) {
  return {
    numeroTicket: body.numeroTicket,
    clienteId: body.clienteId,
    tipoServicioId: body.tipoServicioId,
    modeloId: body.modeloId,
    descripcionProblema: body.descripcionProblema,
    fechaRecepcion: new Date(body.fechaRecepcion),
    entregado: body.entregado,
    fechaEntrega: body.fechaEntrega ? new Date(body.fechaEntrega) : null,
    imei: body.imei ?? null,
    capacidad: body.capacidad ?? null,
    color: body.color ?? null,
    fechaCompra: body.fechaCompra ? new Date(body.fechaCompra) : null,
    tipoDesbloqueo: body.tipoDesbloqueo ?? null,
    codigoDesbloqueo: body.codigoDesbloqueo ?? null,
    redCelular: body.redCelular ?? null,
    puntoRecoleccionId: body.puntoRecoleccionId ?? null,
    presupuestoTotal: body.presupuestoTotal ?? null,
    saldo: body.saldo ?? null,
    pagos: (body.pagos ?? []).map((p) => ({
      metodoPago: p.metodoPago,
      monto: p.monto,
      referencia: p.referencia ?? null,
    })),
    notasEntrega: body.notasEntrega ?? null,
    entregadoPorTexto: body.entregadoPorTexto ?? null,
  };
}

export { assertAdmin };
