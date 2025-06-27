'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { HiOutlineDevicePhoneMobile, HiOutlineClipboardDocumentList, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefonoCelular: string;
  direcciones: {
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
  }[];
}

interface Ticket {
  id: number;
  numeroTicket: string;
  descripcionProblema: string;
  estatusReparacion: {
    nombre: string;
    color: string;
  };
}

interface Reparacion {
  id: number;
  descripcionProblema: string;
  modelo: {
    marca: {
      nombre: string;
    };
    nombre: string;
  };
}

export default function ClientePage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reparaciones, setReparaciones] = useState<Reparacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cliente/dashboard');
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const data = await response.json();
        setCliente(data.cliente);
        setTickets(data.tickets);
        setReparaciones(data.reparaciones);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar los datos');
        if (error instanceof Error && error.message.includes('No autorizado')) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Encabezado */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenido, {cliente.nombre}</h1>
        <p className="text-xl text-muted-foreground">
          Gestiona tus dispositivos y servicios de reparación
        </p>
      </div>

      {/* Información Personal */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Información Personal</CardTitle>
          <CardDescription>Datos de contacto y ubicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{cliente.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
              <p className="text-lg">{cliente.telefonoCelular}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Dirección</p>
              <p className="text-lg">
                {cliente.direcciones && cliente.direcciones.length > 0 
                  ? `${cliente.direcciones[0]?.calle || ''} ${cliente.direcciones[0]?.numeroExterior || ''}${cliente.direcciones[0]?.numeroInterior ? ` Int. ${cliente.direcciones[0].numeroInterior}` : ''}`
                  : 'No registrada'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <HiOutlineDevicePhoneMobile className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Nuevo Ticket</CardTitle>
                <CardDescription>Registra un nuevo dispositivo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/cliente/nuevo-ticket">
              <Button className="w-full">Crear Ticket</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <HiOutlineClipboardDocumentList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Mis Tickets</CardTitle>
                <CardDescription>Gestiona tus tickets de servicio</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/cliente/tickets">
              <Button className="w-full">Ver Tickets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Recientes */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Tickets Recientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{ticket.numeroTicket}</span>
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{
                      backgroundColor: `${ticket.estatusReparacion.color || '#000'}20`,
                      color: ticket.estatusReparacion.color || '#000',
                    }}
                  >
                    {ticket.estatusReparacion.nombre}
                  </span>
                </CardTitle>
                <CardDescription>{ticket.descripcionProblema}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Reparaciones en Proceso */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Reparaciones en Proceso</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reparaciones.map((reparacion) => (
            <Card key={reparacion.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {reparacion.modelo.marca.nombre} {reparacion.modelo.nombre}
                </CardTitle>
                <CardDescription>{reparacion.descripcionProblema}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 