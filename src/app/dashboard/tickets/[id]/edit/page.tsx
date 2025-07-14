'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TicketForm } from '@/app/dashboard/tickets/components/TicketForm';
import RouteGuard from '@/components/route-guard';
import { toast } from 'sonner';

export default function EditTicketPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modelos, setModelos] = useState<any[]>([]);
  const [tiposServicio, setTiposServicio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el ticket
        const ticketResponse = await fetch(`/api/tickets/${params.id}`);
        if (!ticketResponse.ok) {
          throw new Error('Error al cargar el ticket');
        }
        const ticketData = await ticketResponse.json();
        
        // Mapear los datos del ticket de snake_case a camelCase
        const ticketMapeado = {
          id: ticketData.id,
          numeroTicket: ticketData.numero_ticket,
          clienteId: ticketData.cliente_id,
          modeloId: ticketData.modelo_id,
          tipoServicioId: ticketData.tipo_servicio_id,
          descripcionProblema: ticketData.descripcion_problema,
          codigoDesbloqueo: ticketData.codigo_desbloqueo,
          patronDesbloqueo: ticketData.patron_desbloqueo,
          imei: ticketData.imei,
          capacidad: ticketData.capacidad,
          color: ticketData.color,
          fechaCompra: ticketData.fecha_compra,
          redCelular: ticketData.red_celular,
          tipoDesbloqueo: ticketData.tipo_desbloqueo,
          // Relaciones
          clientes: ticketData.clientes,
          modelos: ticketData.modelos,
          tiposServicio: ticketData.tipos_servicio
        };
        
        console.log('Ticket mapeado completo:', ticketMapeado);
        console.log('IMEI del ticket:', ticketMapeado.imei);
        
        setTicket(ticketMapeado);

        // Obtener clientes
        const clientesResponse = await fetch('/api/clientes');
        if (!clientesResponse.ok) {
          throw new Error('Error al cargar los clientes');
        }
        const clientesData = await clientesResponse.json();
        setClientes(clientesData.clientes || []);

        // Obtener marcas
        const marcasResponse = await fetch('/api/catalogo/marcas');
        if (!marcasResponse.ok) {
          throw new Error('Error al cargar las marcas');
        }
        const marcasData = await marcasResponse.json();
        setMarcas(marcasData);

        // Obtener modelos de la marca del ticket
        console.log('Ticket data para modelos:', ticketData);
        console.log('Modelo del ticket:', ticketData.modelos);
        console.log('Marca ID del modelo:', ticketData.modelos?.marca_id);
        
        // Cargar todos los modelos para asegurar que el modelo del ticket esté incluido
        const modelosResponse = await fetch('/api/catalogo/modelos');
        if (!modelosResponse.ok) {
          throw new Error('Error al cargar los modelos');
        }
        const modelosData = await modelosResponse.json();
        console.log('Todos los modelos cargados:', modelosData);
        
        // Verificar que el modelo del ticket esté en la lista
        const modeloDelTicket = modelosData.find((m: any) => m.id === ticketData.modelo_id);
        if (!modeloDelTicket) {
          console.log('⚠️ El modelo del ticket no está en la lista de modelos cargados');
          console.log('Modelo ID del ticket:', ticketData.modelo_id);
          console.log('Modelos disponibles:', modelosData.map((m: any) => ({ id: m.id, nombre: m.nombre, marca: m.marcas?.nombre })));
        } else {
          console.log('✅ Modelo del ticket encontrado en la lista:', modeloDelTicket);
        }
        
        setModelos(modelosData);

        // Obtener tipos de servicio
        const tiposServicioResponse = await fetch('/api/catalogo/tipos-servicio');
        if (!tiposServicioResponse.ok) {
          throw new Error('Error al cargar los tipos de servicio');
        }
        const tiposServicioData = await tiposServicioResponse.json();
        setTiposServicio(tiposServicioData);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error:', err);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`/api/tickets/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el ticket');
      }

      router.push(`/dashboard/tickets/${params.id}`);
      router.refresh();
    } catch (err) {
      setError('Error al actualizar el ticket');
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Ticket no encontrado</div>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard requiredPermissions={['TICKETS_EDIT']} section="Tickets">
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Editar Ticket #{ticket.numeroTicket}</h1>
            <TicketForm
              clientes={clientes}
              marcas={marcas}
              modelos={modelos}
              tiposServicio={tiposServicio}
              ticket={ticket}
            />
          </div>
        </div>
      </div>
    </RouteGuard>
  );
} 