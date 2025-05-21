'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, MagnifyingGlassIcon, PlusIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ticket {
  id: number;
  numeroTicket: string;
  cliente: {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  };
  tipoServicio: {
    nombre: string;
  };
  modelo: {
    nombre: string;
    marca: {
      nombre: string;
    };
  };
  estatusReparacion: {
    nombre: string;
    id: number;
  };
  tecnicoAsignado: {
    nombre: string;
  } | null;
  fechaRecepcion: string;
  descripcionProblema: string | null;
  presupuesto?: {
    total: number;
    anticipo: number;
    saldo: number;
  };
  pagos?: {
    monto: number;
    fecha: string;
    concepto: string;
    metodoPago: string;
  }[];
  cancelado: boolean;
}

export function TicketsTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'cancelled' | 'all'>('active');
  const router = useRouter();
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ticketToCancel, setTicketToCancel] = useState<number | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const url = session?.user?.role === 'TECNICO' 
          ? `/api/tickets?tecnicoId=${session.user.id}`
          : '/api/tickets';
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar los tickets');
        }
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    // Agregar un intervalo para actualizar los datos cada 30 segundos
    const interval = setInterval(fetchTickets, 30000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [session?.user?.id, session?.user?.role]);

  // Agregar un efecto para actualizar cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      const url = session?.user?.role === 'TECNICO' 
        ? `/api/tickets?tecnicoId=${session.user.id}`
        : '/api/tickets';
        
      fetch(url)
        .then(response => response.json())
        .then(data => setTickets(data))
        .catch(error => console.error('Error al actualizar tickets:', error));
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user?.id, session?.user?.role]);

  const filteredTickets = tickets.filter(ticket => {
    // Primero aplicar el filtro de estado
    if (filterStatus === 'active' && ticket.cancelado) return false;
    if (filterStatus === 'cancelled' && !ticket.cancelado) return false;

    // Luego aplicar el filtro de búsqueda
    const searchLower = searchTerm.toLowerCase();
    return (
      ticket.numeroTicket.toLowerCase().includes(searchLower) ||
      ticket.cliente.nombre.toLowerCase().includes(searchLower) ||
      ticket.cliente.apellidoPaterno.toLowerCase().includes(searchLower) ||
      ticket.cliente.apellidoMaterno?.toLowerCase().includes(searchLower) ||
      ticket.tipoServicio.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo.marca.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo.nombre.toLowerCase().includes(searchLower) ||
      ticket.estatusReparacion.nombre.toLowerCase().includes(searchLower) ||
      (ticket.tecnicoAsignado?.nombre.toLowerCase().includes(searchLower) || 'sin asignar'.includes(searchLower))
    );
  });

  const renderAcciones = (ticket: Ticket) => {
    const acciones = [
      {
        icon: <EyeIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}`),
        title: "Ver detalles",
        color: "text-blue-500 hover:text-blue-700"
      }
    ];

    // Solo mostrar botón de edición si el ticket está en estado inicial
    if (ticket.estatusReparacion.id === 1) { // 1 = Pendiente
      acciones.push({
        icon: <PencilIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}/edit`),
        title: "Editar ticket",
        color: "text-green-500 hover:text-green-700"
      });
    }

    // Mostrar botón de reparación si el ticket está en diagnóstico o en reparación
    if (ticket.estatusReparacion.id === 2 || ticket.estatusReparacion.id === 3 || ticket.estatusReparacion.id === 4) { 
      // 2 = En Diagnóstico, 3 = En Reparación, 4 = Esperando Aprobación de Presupuesto
      acciones.push({
        icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
        onClick: () => router.push(`/dashboard/tickets/${ticket.id}/repair`),
        title: "Trabajar en reparación",
        color: "text-orange-500 hover:text-orange-700"
      });
    }

    return acciones;
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket?')) {
      return;
    }

    setIsDeleting(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el ticket');
      }

      setTickets(tickets.filter(ticket => ticket.id !== ticketId));
      toast.success('Ticket eliminado correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      toast.error('Error al eliminar el ticket');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelClick = (ticketId: number) => {
    setTicketToCancel(ticketId);
    setIsDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!ticketToCancel || !motivoCancelacion) {
      toast.error('Por favor, ingresa un motivo de cancelación');
      return;
    }

    setIsDeleting(ticketToCancel);
    try {
      console.log('Enviando solicitud de cancelación:', {
        ticketId: ticketToCancel,
        motivoCancelacion
      });

      const response = await fetch(`/api/tickets/${ticketToCancel}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motivoCancelacion }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Error al cancelar el ticket: ${errorData}`);
      }

      const updatedTicket = await response.json();
      console.log('Ticket actualizado:', updatedTicket);

      setTickets(tickets.map(ticket => 
        ticket.id === ticketToCancel ? updatedTicket : ticket
      ));
      toast.success('Ticket cancelado correctamente');
      router.refresh();
    } catch (error) {
      console.error('Error al cancelar el ticket:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cancelar el ticket');
    } finally {
      setIsDeleting(null);
      setIsDialogOpen(false);
      setMotivoCancelacion("");
      setTicketToCancel(null);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div className="mt-8 flow-root">
        {/* Buscador, filtros y botón de nuevo ticket */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Buscar por número, cliente, servicio, dispositivo, estado o técnico..."
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: 'active' | 'cancelled' | 'all') => setFilterStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Tickets Activos</SelectItem>
                <SelectItem value="cancelled">Tickets Cancelados</SelectItem>
                <SelectItem value="all">Todos los Tickets</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <button
            onClick={() => router.push('/dashboard/tickets/new')}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Nuevo Ticket
          </button>
        </div>

        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Tipo de Servicio</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className={ticket.cancelado ? 'bg-gray-50' : ''}
                    >
                      <TableCell>
                        <button
                          onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {ticket.numeroTicket}
                        </button>
                      </TableCell>
                      <TableCell>{ticket.cliente.nombre} {ticket.cliente.apellidoPaterno} {ticket.cliente.apellidoMaterno || ''}</TableCell>
                      <TableCell>{ticket.modelo.marca.nombre} {ticket.modelo.nombre}</TableCell>
                      <TableCell>{ticket.tipoServicio.nombre}</TableCell>
                      <TableCell>{ticket.tecnicoAsignado ? ticket.tecnicoAsignado.nombre : 'Sin asignar'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          ticket.cancelado 
                            ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                        }`}>
                          {ticket.estatusReparacion.nombre}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(ticket.fechaRecepcion).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderAcciones(ticket).map((accion, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="icon"
                              onClick={accion.onClick}
                            >
                              {accion.icon}
                            </Button>
                          ))}
                          {!ticket.cancelado && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelClick(ticket.id)}
                              disabled={isDeleting === ticket.id}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Ticket</DialogTitle>
            <DialogDescription>
              Por favor, proporciona el motivo de la cancelación del ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de Cancelación</Label>
              <Textarea
                id="motivo"
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Ingresa el motivo de la cancelación..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setMotivoCancelacion("");
                setTicketToCancel(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCancelConfirm}
              disabled={!motivoCancelacion || isDeleting !== null}
            >
              {isDeleting !== null ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 