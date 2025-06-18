import { cn } from "@/lib/utils";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();
    
    // Recibido
    if (statusLower.includes('recibido')) {
      return {
        backgroundColor: '#f3f4f6',
        color: '#1f2937',
        borderColor: '#d1d5db'
      };
    }
    
    // Diagnóstico
    if (statusLower.includes('diagnóstico') || statusLower.includes('diagnostico') || statusLower.includes('diagnostico')) {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderColor: '#f59e0b'
      };
    }
    
    // Presupuesto
    if (statusLower.includes('presupuesto') || statusLower.includes('presupuesto enviado')) {
      return {
        backgroundColor: '#dbeafe',
        color: '#1e40af',
        borderColor: '#3b82f6'
      };
    }
    
    // Reparación
    if (statusLower.includes('reparación') || statusLower.includes('reparacion') || statusLower.includes('en reparación') || statusLower.includes('en reparacion')) {
      return {
        backgroundColor: '#f3e8ff',
        color: '#7c3aed',
        borderColor: '#a855f7'
      };
    }
    
    // Completado/Concluido
    if (statusLower.includes('completado') || statusLower.includes('concluido') || statusLower.includes('finalizado')) {
      return {
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderColor: '#22c55e'
      };
    }
    
    // Por Entregar/Listo
    if (statusLower.includes('entregar') || statusLower.includes('listo') || statusLower.includes('por entregar')) {
      return {
        backgroundColor: '#fed7aa',
        color: '#c2410c',
        borderColor: '#f97316'
      };
    }
    
    // Entregado
    if (statusLower.includes('entregado')) {
      return {
        backgroundColor: '#d1fae5',
        color: '#065f46',
        borderColor: '#10b981'
      };
    }
    
    // Cancelado
    if (statusLower.includes('cancelado')) {
      return {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        borderColor: '#ef4444'
      };
    }
    
    // Pausado
    if (statusLower.includes('pausado')) {
      return {
        backgroundColor: '#f1f5f9',
        color: '#334155',
        borderColor: '#64748b'
      };
    }
    
    // Por defecto
    return {
      backgroundColor: '#f3f4f6',
      color: '#1f2937',
      borderColor: '#d1d5db'
    };
  };

  const statusStyle = getStatusStyle(status);

  return (
    <div 
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
      style={statusStyle}
    >
      {status}
    </div>
  );
} 