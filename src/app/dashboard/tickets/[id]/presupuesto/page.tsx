import { PresupuestoSection } from '@/components/presupuesto-section';
import { prisma } from '@/lib/prisma';

interface PresupuestoPageProps {
  params: {
    id: string;
  };
}

export default async function PresupuestoPage({ params }: PresupuestoPageProps) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      cliente: true,
      modelo: {
        include: {
          marca: true
        }
      },
      tipoServicio: true,
      estatusReparacion: true,
      presupuesto: true
    }
  });

  if (!ticket) {
    return <div>Ticket no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Presupuesto</h1>
      <PresupuestoSection ticketId={ticket.id} />
    </div>
  );
} 