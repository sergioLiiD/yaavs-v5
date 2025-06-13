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