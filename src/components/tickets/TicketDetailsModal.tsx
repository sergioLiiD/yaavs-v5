import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDate } from "@/lib/utils";
import { Ticket } from "./TicketsList";

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function TicketDetailsModal({ ticket, onClose }: TicketDetailsModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Ticket #{ticket.numeroTicket}</DialogTitle>
          <DialogDescription>
            Información detallada del ticket y el dispositivo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Cliente */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {ticket.cliente ? 
                    `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno || ''}` :
                    'No disponible'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{ticket.cliente?.telefonoCelular || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{ticket.cliente?.email || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Información del Dispositivo */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Información del Dispositivo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{ticket.modelo?.marcas?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{ticket.modelo?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">IMEI</p>
                <p className="font-medium">{ticket.imei || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Capacidad</p>
                <p className="mt-1 text-sm text-gray-900">{ticket.dispositivos?.capacidad || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Color</p>
                <p className="mt-1 text-sm text-gray-900">{ticket.dispositivos?.color || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Compra</p>
                <p className="mt-1 text-sm text-gray-900">
                  {ticket.dispositivos?.fechaCompra ? new Date(ticket.dispositivos.fechaCompra).toLocaleDateString() : 'No disponible'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">PIN / Patrón</p>
                <p className="mt-1 text-sm text-gray-900">{ticket.dispositivos?.codigoDesbloqueo || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Información del Servicio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Servicio</p>
                <p className="font-medium">{ticket.tipoServicio?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-medium">{ticket.estatusReparacion?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Recepción</p>
                <p className="font-medium">{formatDate(ticket.fechaRecepcion)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha Estimada de Entrega</p>
                <p className="font-medium">{ticket.fechaEstimadaEntrega ? formatDate(ticket.fechaEstimadaEntrega) : 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Descripción del Problema</h3>
            <p className="text-sm">{ticket.descripcionProblema || 'No disponible'}</p>
          </div>

          {/* Información del Ticket */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Información del Ticket</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <p className="font-medium">{ticket.creador?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de creación</p>
                <p className="font-medium">{formatDate(ticket.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 