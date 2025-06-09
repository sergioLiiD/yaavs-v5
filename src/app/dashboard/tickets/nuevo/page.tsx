import { Metadata } from 'next';
import RouteGuard from '@/components/route-guard';
import { NewTicketForm } from './components/NewTicketForm';

export const metadata: Metadata = {
  title: 'Nuevo Ticket | arregla.mx',
  description: 'Crear un nuevo ticket de servicio',
};

export default function NewTicketPage() {
  return (
    <RouteGuard requiredPermissions={['TICKETS_CREATE']} section="Tickets">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Nuevo Ticket</h1>
        <NewTicketForm />
      </div>
    </RouteGuard>
  );
} 