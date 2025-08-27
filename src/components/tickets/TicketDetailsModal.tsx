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
import { TicketLabelPrint } from "./TicketLabelPrint";

// Función para formatear fecha de pago con fallback
const formatPagoDate = (pago: any) => {
  const dateString = pago.fecha || pago.fechaPago || pago.created_at;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch (error) {
    return 'Fecha inválida';
  }
};

interface Ticket {
  id: number;
  numeroTicket: string;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  imei?: string;
  cliente?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular: string;
    email: string;
  };
  modelo?: {
    id: number;
    nombre: string;
    marca: {
      id: number;
      nombre: string;
    };
  };
  tipoServicio?: {
    id: number;
    nombre: string;
  };
  estatusReparacion?: {
    id: number;
    nombre: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
  dispositivo?: {
    id: number;
    tipo: string;
    marca: string;
    modelo: string;
  };
  presupuesto?: {
    id: number;
    total: number;
    descuento: number;
    totalFinal: number;
    aprobado: boolean;
    fechaAprobacion?: string;
    conceptos: {
      id: number;
      descripcion: string;
      cantidad: number;
      precioUnitario: number;
      total: number;
    }[];
  };
  pagos?: {
    id: number;
    monto: number;
    fecha: string;
    metodoPago: string;
    referencia?: string;
  }[];
}

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

export function TicketDetailsModal({ ticket, onClose }: TicketDetailsModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Detalles del Ticket #{ticket.numeroTicket}</DialogTitle>
              <DialogDescription>
                Información completa del ticket de reparación
              </DialogDescription>
            </div>
            <TicketLabelPrint ticket={ticket} />
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-2 pb-4">
          {/* Información del Cliente */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">
                  {ticket.cliente ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno} ${ticket.cliente.apellidoMaterno || ''}` : 'No disponible'}
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
            <h3 className="text-lg font-semibold text-gray-900">Información del Dispositivo</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Marca</p>
                <p className="font-medium">{ticket.modelo?.marca.nombre || 'No disponible'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelo</p>
                <p className="font-medium">{ticket.modelo?.nombre || 'No disponible'}</p>
              </div>
              {/* <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{ticket.dispositivo?.tipo || 'No disponible'}</p>
              </div> */}
              <div>
                <p className="text-sm text-muted-foreground">IMEI</p>
                <p className="font-medium">{ticket.imei || 'No disponible'}</p>
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Información del Servicio</h3>
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
                <p className="text-sm text-muted-foreground">Técnico Asignado</p>
                <p className="font-medium">
                  {ticket.tecnicoAsignado ? 
                    `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno} ${ticket.tecnicoAsignado.apellidoMaterno || ''}` : 
                    'No asignado'}
                </p>
              </div>
            </div>
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Descripción del Problema</h3>
            <p className="text-sm bg-gray-50 p-3 rounded-md">{ticket.descripcionProblema || 'No disponible'}</p>
          </div>

          {/* Presupuesto */}
          {ticket.presupuesto && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Presupuesto</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-medium">${ticket.presupuesto.totalFinal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Descuento</p>
                  <p className="font-medium">${ticket.presupuesto.descuento.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{ticket.presupuesto.aprobado ? 'Aprobado' : 'Pendiente'}</p>
                </div>
                {ticket.presupuesto.fechaAprobacion && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Aprobación</p>
                    <p className="font-medium">{formatDate(ticket.presupuesto.fechaAprobacion)}</p>
                  </div>
                )}
              </div>

              {/* Conceptos del Presupuesto */}
              {ticket.presupuesto.conceptos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">Conceptos</h4>
                  <div className="space-y-2">
                    {ticket.presupuesto.conceptos.map((concepto) => (
                      <div key={concepto.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{concepto.descripcion}</p>
                          <p className="text-sm text-muted-foreground">
                            {concepto.cantidad} x ${concepto.precioUnitario.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium">${concepto.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pagos */}
          {ticket.pagos && ticket.pagos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Pagos</h3>
              <div className="space-y-2">
                {ticket.pagos.map((pago) => (
                  <div key={pago.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{formatPagoDate(pago)}</p>
                      <p className="text-sm text-muted-foreground">{pago.metodoPago}</p>
                    </div>
                    <p className="font-medium">${pago.monto.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 