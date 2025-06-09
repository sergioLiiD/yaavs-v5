'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EyeIcon, PencilIcon, MagnifyingGlassIcon, PlusIcon, WrenchScrewdriverIcon, UserPlusIcon } from '@heroicons/react/24/outline';
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
import { Eye, Trash2, Pencil, UserPlus, Wrench } from "lucide-react";
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
import { AssignTechnicianModal } from '@/components/tickets/AssignTechnicianModal';
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: number;
  numeroTicket: string;
  cliente: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular?: string;
    email?: string;
  };
  modelo: {
    id: number;
    nombre: string;
    marcas: {
      id: number;
      nombre: string;
    };
  };
  tipoServicio: {
    id: number;
    nombre: string;
  };
  estatusReparacion: {
    id: number;
    nombre: string;
  };
  tecnicoAsignado?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
  } | null;
  fechaRecepcion: string;
  createdAt: string;
  updatedAt: string;
  cancelado: boolean;
  dispositivos?: {
    capacidad?: string;
    color?: string;
    fechaCompra?: string;
    codigoDesbloqueo?: string;
  };
  creador?: {
    nombre: string;
  };
  observaciones?: string;
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
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const url = session?.user?.role === 'TECNICO' 
          ? `/api/tickets?tecnicoId=${session.user.id}`
          : '/api/tickets';
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al cargar los tickets');
        }
        const data = await response.json();
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar los tickets');
        setTickets([]);
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
      if (document.visibilityState === 'visible') {
        fetchTickets();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    return () => document.removeEventListener('visibilitychange', handleFocus);
  }, [session?.user?.id, session?.user?.role]);

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
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al actualizar tickets:', error);
      toast.error('Error al actualizar los tickets');
    }
  };

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
      ticket.modelo.marcas.nombre.toLowerCase().includes(searchLower) ||
      ticket.modelo.nombre.toLowerCase().includes(searchLower) ||
      ticket.estatusReparacion.nombre.toLowerCase().includes(searchLower) ||
      (ticket.tecnicoAsignado?.nombre.toLowerCase().includes(searchLower) || 'sin asignar'.includes(searchLower))
    );
  });

  const renderAcciones = (ticket: Ticket) => {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewDetails(ticket)}
          title="Ver detalles"
          className="p-2 rounded-md bg-[#FEBF19] hover:bg-[#FEBF19]/90"
        >
          <Eye className="h-5 w-5 text-black" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/dashboard/tickets/${ticket.id}/edit`)}
          title="Editar ticket"
          className="p-2 rounded-md bg-[#FEBF19] hover:bg-[#FEBF19]/90"
        >
          <Pencil className="h-5 w-5 text-black" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedTicketId(ticket.id);
            setIsAssignModalOpen(true);
          }}
          title={ticket.tecnicoAsignado ? "Cambiar técnico" : "Asignar técnico"}
          className="p-2 rounded-md bg-[#FEBF19] hover:bg-[#FEBF19]/90"
        >
          <UserPlus className="h-5 w-5 text-black" />
        </Button>
        {ticket.estatusReparacion?.nombre === 'Recibido' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/tickets/${ticket.id}/repair`)}
            title="Trabajar en reparación"
            className="p-2 rounded-md bg-[#FEBF19] hover:bg-[#FEBF19]/90"
          >
            <Wrench className="h-5 w-5 text-black" />
          </Button>
        )}
        {!ticket.cancelado && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(ticket.id)}
            title="Eliminar ticket"
            className="p-2 rounded-md bg-[#FEBF19] hover:bg-[#FEBF19]/90"
          >
            <Trash2 className="h-5 w-5 text-black" />
          </Button>
        )}
      </div>
    );
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

  const renderModelo = (ticket: Ticket) => {
    if (!ticket.modelo) return 'No disponible';
    return `${ticket.modelo.marcas?.nombre || ''} ${ticket.modelo.nombre}`;
  };

  const onViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailsModalOpen(true);
  };

  const onDelete = (ticketId: number) => {
    handleDelete(ticketId);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <Button
            onClick={() => router.push('/dashboard/tickets/nuevo')}
            className="bg-[#FEBF19] hover:bg-[#FEBF19]/90 text-black"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Ticket
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Técnico</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Button
                    variant="link"
                    onClick={() => onViewDetails(ticket)}
                  >
                    {ticket.id}
                  </Button>
                </TableCell>
                <TableCell>
                  {ticket.cliente
                    ? `${ticket.cliente.nombre} ${ticket.cliente.apellidoPaterno}`
                    : 'No disponible'}
                </TableCell>
                <TableCell>{renderModelo(ticket)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ticket.estatusReparacion?.nombre === 'Completado'
                        ? 'default'
                        : ticket.estatusReparacion?.nombre === 'Cancelado'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {ticket.estatusReparacion?.nombre || 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticket.tecnicoAsignado
                    ? `${ticket.tecnicoAsignado.nombre} ${ticket.tecnicoAsignado.apellidoPaterno}`
                    : 'No asignado'}
                </TableCell>
                <TableCell>
                  {new Date(ticket.fechaRecepcion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {renderAcciones(ticket)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Detalles */}
      {selectedTicket && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalles del Ticket {selectedTicket.id}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Información del Cliente</h3>
                <p>Nombre: {selectedTicket.cliente?.nombre} {selectedTicket.cliente?.apellidoPaterno}</p>
                <p>Teléfono: {selectedTicket.cliente?.telefonoCelular}</p>
                <p>Email: {selectedTicket.cliente?.email}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Información del Dispositivo</h3>
                <p>Modelo: {renderModelo(selectedTicket)}</p>
                <p>Capacidad: {selectedTicket.dispositivos?.capacidad || 'No disponible'}</p>
                <p>Color: {selectedTicket.dispositivos?.color || 'No disponible'}</p>
                <p>Fecha de Compra: {selectedTicket.dispositivos?.fechaCompra || 'No disponible'}</p>
                <p>PIN/Pattern: {selectedTicket.dispositivos?.codigoDesbloqueo || 'No disponible'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Información del Servicio</h3>
                <p>Tipo de Servicio: {selectedTicket.tipoServicio?.nombre}</p>
                <p>Estado: {selectedTicket.estatusReparacion?.nombre}</p>
                <p>Técnico Asignado: {selectedTicket.tecnicoAsignado ? `${selectedTicket.tecnicoAsignado.nombre} ${selectedTicket.tecnicoAsignado.apellidoPaterno}` : 'No asignado'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Información Adicional</h3>
                <p>Fecha de Recepción: {new Date(selectedTicket.fechaRecepcion).toLocaleDateString()}</p>
                <p>Creado por: {selectedTicket.creador?.nombre}</p>
                <p>Observaciones: {selectedTicket.observaciones || 'Sin observaciones'}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Asignación de Técnico */}
      <AssignTechnicianModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        ticketId={selectedTicketId || 0}
        onAssign={() => {
          setIsAssignModalOpen(false);
          fetchTickets();
        }}
      />
    </div>
  );
} 