import { MetodoPago, Prisma, PrismaClient, TipoEntrega } from '@prisma/client';
import {
  normalizeNumeroTicket,
  resolveEstatusRecuperado,
} from '@/lib/tickets-recuperados-utils';

export {
  NUMERO_TICKET_REGEX,
  normalizeNumeroTicket,
  inferFechaRecepcionFromNumeroTicket,
  resolveEstatusRecuperado,
} from '@/lib/tickets-recuperados-utils';

export interface PagoRecuperadoInput {
  metodoPago: MetodoPago;
  monto: number;
  referencia?: string | null;
}

export interface TicketRecuperadoInput {
  numeroTicket: string;
  clienteId: number;
  tipoServicioId: number;
  modeloId: number;
  descripcionProblema: string;
  fechaRecepcion: Date;
  entregado: boolean;
  fechaEntrega?: Date | null;
  imei?: string | null;
  capacidad?: string | null;
  color?: string | null;
  fechaCompra?: Date | null;
  tipoDesbloqueo?: string | null;
  codigoDesbloqueo?: string | null;
  redCelular?: string | null;
  puntoRecoleccionId?: number | null;
  presupuestoTotal?: number | null;
  pagos?: PagoRecuperadoInput[];
  saldo?: number | null;
  notasEntrega?: string | null;
  entregadoPorTexto?: string | null;
}

function normalizeFinancials(input: TicketRecuperadoInput) {
  const presupuestoTotal = Number(input.presupuestoTotal ?? 0);
  const pagos = input.pagos ?? [];
  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0);
  const saldo =
    input.saldo != null
      ? Number(input.saldo)
      : Math.max(0, presupuestoTotal - totalPagado);

  if (presupuestoTotal > 0 && Math.abs(presupuestoTotal - totalPagado - saldo) > 0.01) {
    throw new Error('Presupuesto, pagos y saldo no cuadran');
  }

  return { presupuestoTotal, pagos, totalPagado, saldo };
}

async function getCatalogMaps(prisma: PrismaClient) {
  const [estatusEntregado, estatusReparado, estatusEnReparacion, estatusRecibido] =
    await Promise.all([
      prisma.estatus_reparacion.findFirst({ where: { nombre: 'Entregado' } }),
      prisma.estatus_reparacion.findFirst({ where: { nombre: 'Reparado' } }),
      prisma.estatus_reparacion.findFirst({ where: { nombre: 'En Reparación' } }),
      prisma.estatus_reparacion.findFirst({ where: { nombre: 'Recibido' } }),
    ]);

  if (!estatusEntregado || !estatusEnReparacion || !estatusRecibido) {
    throw new Error('Faltan estatus de reparación en catálogo');
  }

  const estatusByName = {
    Entregado: estatusEntregado,
    Reparado: estatusReparado ?? estatusRecibido,
    'En Reparación': estatusEnReparacion,
    Recibido: estatusRecibido,
  };

  return estatusByName;
}

function pickEstatusId(
  entregado: boolean,
  saldo: number,
  estatusByName: Awaited<ReturnType<typeof getCatalogMaps>>
) {
  const nombre = resolveEstatusRecuperado(entregado, saldo);
  return estatusByName[nombre as keyof typeof estatusByName].id;
}

export async function createTicketRecuperado(
  prisma: PrismaClient,
  input: TicketRecuperadoInput,
  creadorId: number
) {
  const numeroTicket = normalizeNumeroTicket(input.numeroTicket);
  const { presupuestoTotal, pagos, saldo } = normalizeFinancials(input);
  const estatusByName = await getCatalogMaps(prisma);
  const estatusId = pickEstatusId(input.entregado, saldo, estatusByName);

  const existing = await prisma.tickets.findUnique({
    where: { numero_ticket: numeroTicket },
  });
  if (existing) {
    throw new Error(`Ya existe un ticket con número ${numeroTicket}`);
  }

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.tickets.create({
      data: {
        numero_ticket: numeroTicket,
        fecha_recepcion: input.fechaRecepcion,
        fecha_entrega: input.entregado ? input.fechaEntrega ?? input.fechaRecepcion : null,
        descripcion_problema: input.descripcionProblema,
        imei: input.imei || null,
        capacidad: input.capacidad || null,
        color: input.color || null,
        fecha_compra: input.fechaCompra ?? null,
        tipo_desbloqueo: input.tipoDesbloqueo || null,
        codigo_desbloqueo: input.codigoDesbloqueo || null,
        red_celular: input.redCelular || null,
        entregado: input.entregado,
        recuperacion_manual: true,
        cliente_id: input.clienteId,
        tipo_servicio_id: input.tipoServicioId,
        modelo_id: input.modeloId,
        estatus_reparacion_id: estatusId,
        creador_id: creadorId,
        punto_recoleccion_id: input.puntoRecoleccionId ?? null,
        updated_at: new Date(),
      },
    });

    if (presupuestoTotal > 0) {
      await tx.presupuestos.create({
        data: {
          ticket_id: ticket.id,
          total: presupuestoTotal,
          descuento: 0,
          total_final: presupuestoTotal,
          saldo,
          pagado: saldo <= 0,
          aprobado: true,
          fecha_aprobacion: input.fechaRecepcion,
          updated_at: new Date(),
          conceptos_presupuesto: {
            create: {
              descripcion: input.descripcionProblema,
              cantidad: 1,
              precio_unitario: presupuestoTotal,
              total: presupuestoTotal,
              updated_at: new Date(),
            },
          },
        },
      });
    }

    for (const pago of pagos) {
      await tx.pagos.create({
        data: {
          ticket_id: ticket.id,
          monto: pago.monto,
          metodo: pago.metodoPago,
          referencia: pago.referencia || null,
          created_at: input.fechaEntrega ?? input.fechaRecepcion,
          updated_at: new Date(),
        },
      });
    }

    if (input.entregado) {
      await tx.entregas.create({
        data: {
          ticket_id: ticket.id,
          tipo: TipoEntrega.PUNTO_RECOLECCION,
          notas:
            input.notasEntrega ||
            `Ticket recuperado manualmente${input.entregadoPorTexto ? `. Entregado por: ${input.entregadoPorTexto}` : ''}`,
          updated_at: new Date(),
        },
      });
    }

    return ticket;
  });
}

export async function updateTicketRecuperado(
  prisma: PrismaClient,
  ticketId: number,
  input: TicketRecuperadoInput
) {
  const numeroTicket = normalizeNumeroTicket(input.numeroTicket);
  const { presupuestoTotal, pagos, saldo } = normalizeFinancials(input);
  const estatusByName = await getCatalogMaps(prisma);
  const estatusId = pickEstatusId(input.entregado, saldo, estatusByName);

  const current = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: { presupuestos: true, entregas: true },
  });

  if (!current) throw new Error('Ticket no encontrado');

  if (!current.recuperacion_manual) {
    const cliente = await prisma.clientes.findUnique({ where: { id: current.cliente_id } });
    if (cliente?.tipo_registro !== 'recuperacion_manual') {
      throw new Error('Solo se pueden editar tickets de recuperación manual');
    }
  }

  const duplicate = await prisma.tickets.findFirst({
    where: { numero_ticket: numeroTicket, id: { not: ticketId } },
  });
  if (duplicate) {
    throw new Error(`Ya existe otro ticket con número ${numeroTicket}`);
  }

  return prisma.$transaction(async (tx) => {
    const ticket = await tx.tickets.update({
      where: { id: ticketId },
      data: {
        numero_ticket: numeroTicket,
        fecha_recepcion: input.fechaRecepcion,
        fecha_entrega: input.entregado ? input.fechaEntrega ?? input.fechaRecepcion : null,
        descripcion_problema: input.descripcionProblema,
        imei: input.imei || null,
        capacidad: input.capacidad || null,
        color: input.color || null,
        fecha_compra: input.fechaCompra ?? null,
        tipo_desbloqueo: input.tipoDesbloqueo || null,
        codigo_desbloqueo: input.codigoDesbloqueo || null,
        red_celular: input.redCelular || null,
        entregado: input.entregado,
        recuperacion_manual: true,
        cliente_id: input.clienteId,
        tipo_servicio_id: input.tipoServicioId,
        modelo_id: input.modeloId,
        estatus_reparacion_id: estatusId,
        punto_recoleccion_id: input.puntoRecoleccionId ?? null,
        updated_at: new Date(),
      },
    });

    if (presupuestoTotal > 0) {
      await tx.presupuestos.upsert({
        where: { ticket_id: ticketId },
        create: {
          ticket_id: ticketId,
          total: presupuestoTotal,
          descuento: 0,
          total_final: presupuestoTotal,
          saldo,
          pagado: saldo <= 0,
          aprobado: true,
          fecha_aprobacion: input.fechaRecepcion,
          updated_at: new Date(),
          conceptos_presupuesto: {
            create: {
              descripcion: input.descripcionProblema,
              cantidad: 1,
              precio_unitario: presupuestoTotal,
              total: presupuestoTotal,
              updated_at: new Date(),
            },
          },
        },
        update: {
          total: presupuestoTotal,
          total_final: presupuestoTotal,
          saldo,
          pagado: saldo <= 0,
          aprobado: true,
          updated_at: new Date(),
          conceptos_presupuesto: {
            deleteMany: {},
            create: {
              descripcion: input.descripcionProblema,
              cantidad: 1,
              precio_unitario: presupuestoTotal,
              total: presupuestoTotal,
              updated_at: new Date(),
            },
          },
        },
      });
    } else if (current.presupuestos) {
      await tx.conceptos_presupuesto.deleteMany({ where: { presupuesto_id: current.presupuestos.id } });
      await tx.presupuestos.delete({ where: { id: current.presupuestos.id } });
    }

    await tx.pagos.deleteMany({ where: { ticket_id: ticketId } });
    for (const pago of pagos) {
      await tx.pagos.create({
        data: {
          ticket_id: ticketId,
          monto: pago.monto,
          metodo: pago.metodoPago,
          referencia: pago.referencia || null,
          created_at: input.fechaEntrega ?? input.fechaRecepcion,
          updated_at: new Date(),
        },
      });
    }

    if (input.entregado) {
      await tx.entregas.upsert({
        where: { ticket_id: ticketId },
        create: {
          ticket_id: ticketId,
          tipo: TipoEntrega.PUNTO_RECOLECCION,
          notas: input.notasEntrega || 'Ticket recuperado manualmente',
          updated_at: new Date(),
        },
        update: {
          notas: input.notasEntrega || 'Ticket recuperado manualmente',
          updated_at: new Date(),
        },
      });
    } else if (current.entregas) {
      await tx.entregas.delete({ where: { ticket_id: ticketId } });
    }

    return ticket;
  });
}

export const ticketRecuperadoListInclude = {
  clientes: true,
  modelos: { include: { marcas: true } },
  estatus_reparacion: true,
  presupuestos: true,
  pagos: true,
  tipos_servicio: true,
} satisfies Prisma.ticketsInclude;
