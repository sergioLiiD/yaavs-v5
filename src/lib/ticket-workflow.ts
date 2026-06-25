import { Prisma, TipoExcepcionFlujo } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type WorkflowAction =
  | 'DIAGNOSTICO'
  | 'PRESUPUESTO'
  | 'PAGO'
  | 'REPARACION'
  | 'ENTREGA';

export interface TicketWorkflowContext {
  id: number;
  tecnico_asignado_id: number | null;
  fecha_fin_diagnostico: Date | null;
  estatus_reparacion?: { nombre: string } | null;
  presupuestos?: { total: number } | null;
  pagos?: { monto: number; estado?: string }[];
  reparaciones?: {
    diagnostico: string | null;
  } | null;
}

export interface WorkflowGateResult {
  allowed: boolean;
  blockedBy?: TipoExcepcionFlujo;
  message?: string;
  canAdminBypass: boolean;
}

export interface WorkflowStatus {
  tecnicoAsignado: boolean;
  diagnosticoCompletado: boolean;
  pagoCompleto: boolean;
  saldoPendiente: number;
  gates: Record<WorkflowAction, WorkflowGateResult>;
  excepciones: Array<{
    id: number;
    tipo: TipoExcepcionFlujo;
    razon: string;
    createdAt: string;
    usuario: { id: number; nombre: string; apellido_paterno: string };
  }>;
}

export class WorkflowValidationError extends Error {
  blockedBy?: TipoExcepcionFlujo;
  statusCode: number;

  constructor(message: string, blockedBy?: TipoExcepcionFlujo, statusCode = 400) {
    super(message);
    this.name = 'WorkflowValidationError';
    this.blockedBy = blockedBy;
    this.statusCode = statusCode;
  }
}

export function hasTecnicoAsignado(ticket: TicketWorkflowContext): boolean {
  return ticket.tecnico_asignado_id != null;
}

export function hasDiagnosticoCompleto(ticket: TicketWorkflowContext): boolean {
  if (ticket.fecha_fin_diagnostico) return true;

  const statusName = ticket.estatus_reparacion?.nombre;
  if (statusName === 'Diagnóstico Completado') return true;

  const diagnostico = ticket.reparaciones?.diagnostico?.trim();
  return Boolean(diagnostico);
}

export function calcularSaldo(ticket: TicketWorkflowContext): number {
  const total = ticket.presupuestos?.total ?? 0;
  const pagosActivos = (ticket.pagos ?? []).filter(
    (p) => !p.estado || p.estado === 'ACTIVO'
  );
  const totalPagos = pagosActivos.reduce((sum, p) => sum + p.monto, 0);
  return Math.max(0, total - totalPagos);
}

export function isPagoCompleto(ticket: TicketWorkflowContext): boolean {
  if (!ticket.presupuestos) return false;
  return calcularSaldo(ticket) <= 0;
}

export function isAdmin(role: string): boolean {
  return role === 'ADMINISTRADOR';
}

function gate(
  allowed: boolean,
  blockedBy: TipoExcepcionFlujo | undefined,
  message: string
): WorkflowGateResult {
  return {
    allowed,
    blockedBy: allowed ? undefined : blockedBy,
    message: allowed ? undefined : message,
    canAdminBypass: !allowed,
  };
}

export function evaluateGate(
  ticket: TicketWorkflowContext,
  action: WorkflowAction
): WorkflowGateResult {
  switch (action) {
    case 'DIAGNOSTICO':
      if (!hasTecnicoAsignado(ticket)) {
        return gate(
          false,
          'SIN_TECNICO_ASIGNADO',
          'Debe asignar un técnico antes de realizar el diagnóstico.'
        );
      }
      return gate(true, undefined, '');

    case 'PRESUPUESTO':
      if (!hasTecnicoAsignado(ticket)) {
        return gate(
          false,
          'SIN_TECNICO_ASIGNADO',
          'Debe asignar un técnico antes de generar el presupuesto.'
        );
      }
      if (!hasDiagnosticoCompleto(ticket)) {
        return gate(
          false,
          'SIN_DIAGNOSTICO',
          'Debe completar el diagnóstico antes de generar el presupuesto.'
        );
      }
      return gate(true, undefined, '');

    case 'PAGO':
      if (!ticket.presupuestos) {
        return gate(false, 'SIN_DIAGNOSTICO', 'El ticket debe tener un presupuesto antes de registrar pagos.');
      }
      return gate(true, undefined, '');

    case 'REPARACION':
      if (!hasTecnicoAsignado(ticket)) {
        return gate(
          false,
          'SIN_TECNICO_ASIGNADO',
          'Debe asignar un técnico responsable antes de iniciar o completar la reparación.'
        );
      }
      if (!ticket.presupuestos) {
        return gate(
          false,
          'SIN_DIAGNOSTICO',
          'El ticket debe tener un presupuesto antes de la reparación.'
        );
      }
      return gate(true, undefined, '');

    case 'ENTREGA':
      if (ticket.estatus_reparacion?.nombre !== 'Reparado') {
        return {
          allowed: false,
          message: 'El ticket debe estar en estado "Reparado" para entregarlo.',
          canAdminBypass: false,
        };
      }
      if (!isPagoCompleto(ticket)) {
        return gate(
          false,
          'ENTREGA_SIN_PAGO_COMPLETO',
          `El equipo no puede entregarse con saldo pendiente de $${calcularSaldo(ticket).toFixed(2)}.`
        );
      }
      return gate(true, undefined, '');

    default:
      return gate(true, undefined, '');
  }
}

export function getWorkflowStatus(
  ticket: TicketWorkflowContext,
  excepciones: WorkflowStatus['excepciones'] = []
): WorkflowStatus {
  const actions: WorkflowAction[] = [
    'DIAGNOSTICO',
    'PRESUPUESTO',
    'PAGO',
    'REPARACION',
    'ENTREGA',
  ];

  const gates = actions.reduce(
    (acc, action) => {
      acc[action] = evaluateGate(ticket, action);
      return acc;
    },
    {} as Record<WorkflowAction, WorkflowGateResult>
  );

  return {
    tecnicoAsignado: hasTecnicoAsignado(ticket),
    diagnosticoCompletado: hasDiagnosticoCompleto(ticket),
    pagoCompleto: isPagoCompleto(ticket),
    saldoPendiente: calcularSaldo(ticket),
    gates,
    excepciones,
  };
}

type PrismaTx = Prisma.TransactionClient;

export async function registrarExcepcionFlujo(params: {
  ticketId: number;
  usuarioId: number;
  tipo: TipoExcepcionFlujo;
  razon: string;
  metadata?: Record<string, unknown>;
  tx?: PrismaTx;
}): Promise<void> {
  const razon = params.razon.trim();
  if (!razon) {
    throw new WorkflowValidationError('Debe proporcionar una razón para la excepción.');
  }

  const client = params.tx ?? prisma;
  await client.excepciones_flujo.create({
    data: {
      ticket_id: params.ticketId,
      usuario_id: params.usuarioId,
      tipo: params.tipo,
      razon,
      metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
    },
  });
}

export async function assertWorkflowAllowed(params: {
  ticket: TicketWorkflowContext;
  action: WorkflowAction;
  userRole: string;
  usuarioId: number;
  razonExcepcion?: string;
  metadata?: Record<string, unknown>;
  tx?: PrismaTx;
}): Promise<void> {
  const gateResult = evaluateGate(params.ticket, params.action);

  if (gateResult.allowed) return;

  if (!gateResult.canAdminBypass || !gateResult.blockedBy) {
    throw new WorkflowValidationError(
      gateResult.message ?? 'Acción no permitida en el estado actual del ticket.',
      gateResult.blockedBy
    );
  }

  if (!isAdmin(params.userRole)) {
    throw new WorkflowValidationError(
      gateResult.message ?? 'Acción no permitida.',
      gateResult.blockedBy
    );
  }

  if (!params.razonExcepcion?.trim()) {
    throw new WorkflowValidationError(
      `${gateResult.message} Como administrador, debe indicar la razón de la excepción.`,
      gateResult.blockedBy,
      422
    );
  }

  await registrarExcepcionFlujo({
    ticketId: params.ticket.id,
    usuarioId: params.usuarioId,
    tipo: gateResult.blockedBy,
    razon: params.razonExcepcion,
    metadata: {
      action: params.action,
      ...params.metadata,
    },
    tx: params.tx,
  });
}

export async function loadTicketWorkflowContext(ticketId: number) {
  return prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      estatus_reparacion: true,
      presupuestos: true,
      pagos: true,
      reparaciones: {
        select: { diagnostico: true },
      },
    },
  });
}

export function handleWorkflowError(error: unknown) {
  if (error instanceof WorkflowValidationError) {
    return {
      status: error.statusCode,
      body: {
        error: error.message,
        blockedBy: error.blockedBy,
        requiresException: error.statusCode === 422,
      },
    };
  }
  return null;
}
