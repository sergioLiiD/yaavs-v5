'use client';

import AdminOnlyGuard from '@/components/admin-only-guard';
import { TicketRecuperadoForm } from '../components/TicketRecuperadoForm';

export default function NuevoTicketRecuperadoPage() {
  return (
    <AdminOnlyGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Registrar ticket recuperado</h1>
        <p className="text-muted-foreground mb-8">
          Alta manual de un ticket físico histórico. El cliente debe existir previamente.
        </p>
        <TicketRecuperadoForm />
      </div>
    </AdminOnlyGuard>
  );
}
