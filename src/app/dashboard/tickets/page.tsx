import { Metadata } from 'next';
import RouteGuard from '@/components/route-guard';
import { TicketsTable } from './components/TicketsTable';

export const metadata: Metadata = {
  title: 'Tickets | arregla.mx',
  description: 'Gestión de tickets de reparación',
};

export default function TicketsPage() {
  return (
    <RouteGuard requiredPermissions={['TICKETS_VIEW']} section="Tickets">
      <div className="container mx-auto py-6">
        <TicketsTable />
      </div>
    </RouteGuard>
  );
} 