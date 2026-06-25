import type { TipoExcepcionFlujo } from '@prisma/client';
import type { WorkflowAction } from '@/lib/ticket-workflow';

export interface WorkflowGateResult {
  allowed: boolean;
  blockedBy?: TipoExcepcionFlujo;
  message?: string;
  canAdminBypass: boolean;
}

export interface WorkflowStatusResponse {
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

export interface WorkflowExceptionPayload {
  razonExcepcion?: string;
}
