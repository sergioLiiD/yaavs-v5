import { Badge } from "@/components/ui/badge";

interface TicketStatusBadgeProps {
  status: string;
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En diagnóstico':
        return 'bg-yellow-100 text-yellow-800';
      case 'Presupuesto enviado':
        return 'bg-blue-100 text-blue-800';
      case 'En reparación':
        return 'bg-purple-100 text-purple-800';
      case 'Completado':
      case 'Reparación Completada':
        return 'bg-green-100 text-green-800';
      case 'Por Entregar':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  );
} 