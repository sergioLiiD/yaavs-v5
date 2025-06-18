import { Metadata } from 'next';
import { ClienteTicketsTable } from '@/components/cliente/ClienteTicketsTable';
import { Toaster } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { ClienteService } from '@/services/clienteService';
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi";

export const metadata: Metadata = {
  title: 'Mis Tickets | YAAVS',
  description: 'Gestiona tus tickets de servicio',
};

export default async function ClienteTicketsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('cliente_token');

  if (!token) {
    redirect("/cliente/login");
  }

  const decoded = await verifyToken(token.value);
  if (!decoded || !decoded.id) {
    redirect("/cliente/login");
  }

  const cliente = await ClienteService.findById(decoded.id);
  if (!cliente) {
    redirect("/cliente/login");
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      clienteId: cliente.id,
    },
    include: {
      modelo: {
        include: {
          marca: true,
        },
      },
      estatusReparacion: true,
      presupuesto: true,
      pagos: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Tickets</h1>
        <div className="flex gap-4">
          <Link href="/cliente">
            <Button variant="outline" className="flex items-center gap-2">
              <HiArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/cliente/nuevo-ticket">
            <Button>Nuevo Ticket</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{ticket.numeroTicket}</span>
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
              <CardDescription>
                {format(new Date(ticket.createdAt), "PPP", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dispositivo:</span>{" "}
                  {ticket.modelo.marca.nombre} {ticket.modelo.nombre}
                </p>
                <p>
                  <span className="font-semibold">Problema:</span>{" "}
                  {ticket.descripcionProblema}
                </p>
                {ticket.presupuesto && (
                  <p>
                    <span className="font-semibold">Presupuesto:</span>{" "}
                    ${ticket.presupuesto.totalFinal.toFixed(2)}
                  </p>
                )}
                {ticket.pagos && ticket.pagos.length > 0 && (
                  <p>
                    <span className="font-semibold">Último pago:</span>{" "}
                    ${ticket.pagos[0].monto.toFixed(2)} -{" "}
                    {format(new Date(ticket.pagos[0].createdAt), "PPP", {
                      locale: es,
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Toaster />
    </div>
  );
} 