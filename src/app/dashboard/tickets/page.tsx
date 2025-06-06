import { Metadata } from 'next';
import { PermissionRoute } from '@/components/auth/PermissionRoute';
import { TicketsTable } from './components/TicketsTable';

export const metadata: Metadata = {
  title: 'Tickets | YAAVS',
  description: 'Gestión de tickets de reparación',
};

export default function TicketsPage() {
  return (
    <PermissionRoute requiredPermissions={['TICKETS_VIEW']}>
      <div className="container mx-auto py-6">
        <TicketsTable />
      </div>
    </PermissionRoute>
  );
} 