'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminOnlyGuard from '@/components/admin-only-guard';
import { TicketRecuperadoForm } from '../../components/TicketRecuperadoForm';
import { toast } from 'sonner';

export default function EditarTicketRecuperadoPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/tickets-recuperados/${params.id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'No se pudo cargar');
        }
        setTicket(await res.json());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar');
        router.push('/dashboard/tickets-recuperados');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id, router]);

  return (
    <AdminOnlyGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Editar ticket recuperado</h1>
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : ticket ? (
          <TicketRecuperadoForm ticketId={Number(params.id)} initialData={ticket} />
        ) : null}
      </div>
    </AdminOnlyGuard>
  );
}
