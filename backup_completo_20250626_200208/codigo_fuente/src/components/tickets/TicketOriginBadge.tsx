import { User, Building2, Home } from "lucide-react";

interface TicketOriginBadgeProps {
  creador: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    usuarioRoles?: {
      rol: {
        nombre: string;
      };
    }[];
  };
  puntoRecoleccion?: {
    id: number;
    nombre: string;
    isRepairPoint: boolean;
  } | null;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
  // Campo adicional para identificar si fue creado por cliente
  origenCliente?: boolean;
}

export function TicketOriginBadge({ creador, puntoRecoleccion, cliente, origenCliente }: TicketOriginBadgeProps) {
  const getOriginInfo = () => {
    // Si tenemos información explícita de que fue creado por cliente
    if (origenCliente || (cliente && !creador.usuarioRoles?.length)) {
      return {
        type: 'cliente',
        label: 'Cliente',
        icon: User,
        style: {
          backgroundColor: '#f1f5f9',
          color: '#334155',
          borderColor: '#cbd5e1'
        }
      };
    }
    
    // Obtener el rol principal del creador
    const roles = creador.usuarioRoles?.map(ur => ur.rol.nombre) || [];
    const hasRole = roles.length > 0;
    
    // Si el creador es un cliente (no tiene roles o solo tiene rol CLIENTE)
    if (!hasRole || roles.includes('CLIENTE')) {
      return {
        type: 'cliente',
        label: 'Cliente',
        icon: User,
        style: {
          backgroundColor: '#f1f5f9',
          color: '#334155',
          borderColor: '#cbd5e1'
        }
      };
    }
    
    // Si el creador es de un punto de recolección
    if (roles.includes('ADMINISTRADOR_PUNTO') || roles.includes('USUARIO_PUNTO')) {
      return {
        type: 'punto',
        label: puntoRecoleccion?.nombre || 'Punto de Recolección',
        icon: Building2,
        style: {
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          borderColor: '#93c5fd'
        }
      };
    }
    
    // Si el creador es del sistema central (ADMINISTRADOR, TECNICO, etc.)
    return {
      type: 'central',
      label: 'Central',
      icon: Home,
      style: {
        backgroundColor: '#f9fafb',
        color: '#374151',
        borderColor: '#d1d5db'
      }
    };
  };

  const originInfo = getOriginInfo();
  const IconComponent = originInfo.icon;

  return (
    <div 
      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
      style={originInfo.style}
    >
      <IconComponent className="h-3 w-3 mr-1" />
      {originInfo.label}
    </div>
  );
} 