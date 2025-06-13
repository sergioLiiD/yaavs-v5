import { Badge } from "@/components/ui/badge";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'recibido':
        return 'default';
      case 'en diagnóstico':
        return 'secondary';
      case 'en reparación':
        return 'outline';
      case 'reparado':
        return 'default';
      case 'entregado':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      case 'pendiente':
        return 'outline';
      case 'en espera de repuestos':
        return 'secondary';
      case 'en espera de aprobación':
        return 'outline';
      case 'en espera de pago':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {status || 'Sin estado'}
    </Badge>
  );
} 