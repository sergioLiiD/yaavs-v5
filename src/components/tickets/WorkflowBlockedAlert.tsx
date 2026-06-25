'use client';

import { AlertTriangle } from 'lucide-react';
import type { WorkflowGateResult } from '@/types/workflow';

interface WorkflowBlockedAlertProps {
  gate: WorkflowGateResult;
  isAdmin: boolean;
  onRequestException?: () => void;
}

export function WorkflowBlockedAlert({
  gate,
  isAdmin,
  onRequestException,
}: WorkflowBlockedAlertProps) {
  if (gate.allowed) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-amber-900">{gate.message}</p>
          {isAdmin && gate.canAdminBypass && onRequestException && (
            <button
              type="button"
              onClick={onRequestException}
              className="text-sm font-medium text-amber-800 underline hover:text-amber-950"
            >
              Continuar como administrador (requiere justificación)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface WorkflowExceptionsHistoryProps {
  excepciones: Array<{
    id: number;
    tipo: string;
    razon: string;
    createdAt: string;
    usuario: { nombre: string; apellido_paterno: string };
  }>;
}

export function WorkflowExceptionsHistory({ excepciones }: WorkflowExceptionsHistoryProps) {
  if (!excepciones.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Excepciones registradas</h4>
      <ul className="space-y-2">
        {excepciones.map((e) => (
          <li key={e.id} className="text-sm text-gray-600 border-l-2 border-amber-400 pl-3">
            <span className="font-medium text-gray-800">
              {e.usuario.nombre} {e.usuario.apellido_paterno}
            </span>
            {' · '}
            <span className="text-xs text-gray-500">
              {new Date(e.createdAt).toLocaleString('es-MX')}
            </span>
            <p className="mt-0.5">{e.razon}</p>
            <p className="text-xs text-gray-400">{e.tipo}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
