import { Metadata } from 'next';
import { ClienteTicketsTable } from '@/components/cliente/ClienteTicketsTable';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Mis Tickets | YAAVS',
  description: 'Gestiona tus tickets de servicio',
};

export default function ClienteTicketsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mis Tickets de Servicio</h1>
        <ClienteTicketsTable />
      </div>
      <Toaster />
    </div>
  );
} 