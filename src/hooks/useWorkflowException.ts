'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { WorkflowAction, WorkflowStatusResponse } from '@/types/workflow';

interface UseWorkflowExceptionOptions {
  ticketId: number;
  action: WorkflowAction;
  workflow: WorkflowStatusResponse | null;
  onWorkflowRefresh?: () => void;
}

export function useWorkflowException({
  action,
  workflow,
  onWorkflowRefresh,
}: UseWorkflowExceptionOptions) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMINISTRADOR';
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [pendingRazon, setPendingRazon] = useState<string | undefined>();
  const [resolver, setResolver] = useState<((razon?: string) => void) | null>(null);

  const gate = workflow?.gates[action] ?? { allowed: true, canAdminBypass: false };

  const requestExceptionReason = useCallback((): Promise<string | undefined> => {
    if (gate.allowed) return Promise.resolve(undefined);

    if (isAdmin && gate.canAdminBypass) {
      return new Promise((resolve) => {
        setResolver(() => resolve);
        setExceptionOpen(true);
      });
    }

    return Promise.reject(new Error(gate.message ?? 'Acción no permitida'));
  }, [gate, isAdmin]);

  const wrapWithWorkflow = useCallback(
    async <T,>(execute: (razonExcepcion?: string) => Promise<T>): Promise<T> => {
      if (gate.allowed) {
        return execute(undefined);
      }

      if (isAdmin && gate.canAdminBypass) {
        const razon = await requestExceptionReason();
        const result = await execute(razon);
        onWorkflowRefresh?.();
        return result;
      }

      throw new Error(gate.message ?? 'Acción no permitida');
    },
    [gate, isAdmin, requestExceptionReason, onWorkflowRefresh]
  );

  return {
    gate,
    isAdmin,
    canProceed: gate.allowed || (isAdmin && gate.canAdminBypass),
    pendingRazon,
    wrapWithWorkflow,
    requestExceptionReason,
    openExceptionDialog: () => setExceptionOpen(true),
  };
}

export async function executeWorkflowRequest<T>(
  gate: { allowed: boolean; canAdminBypass: boolean; message?: string } | undefined,
  isAdmin: boolean,
  requestFn: (razonExcepcion?: string) => Promise<T>,
  onNeedException: () => Promise<string>
): Promise<T> {
  if (!gate || gate.allowed) {
    return requestFn();
  }

  if (isAdmin && gate.canAdminBypass) {
    const razon = await onNeedException();
    return requestFn(razon);
  }

  throw new Error(gate.message ?? 'Acción no permitida');
}

export function useTicketWorkflow(ticketId: number) {
  const [workflow, setWorkflow] = useState<WorkflowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}/workflow`);
      if (res.ok) {
        setWorkflow(await res.json());
      }
    } catch (error) {
      console.error('Error al cargar flujo del ticket:', error);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  return { workflow, loading, refreshWorkflow };
}
