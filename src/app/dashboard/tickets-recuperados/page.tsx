'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminOnlyGuard from '@/components/admin-only-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HiPencilAlt, HiPlus, HiSearch } from 'react-icons/hi';
import { toast } from 'sonner';

interface TicketRow {
  id: number;
  numero_ticket: string;
  fecha_recepcion: string;
  entregado: boolean;
  descripcion_problema: string | null;
  recuperacion_manual: boolean;
  clientes: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
  };
  modelos: {
    nombre: string;
    marcas: { nombre: string };
  };
  presupuestos: { total: number; saldo: number } | null;
  estatus_reparacion: { nombre: string };
}

export default function TicketsRecuperadosPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/admin/tickets-recuperados${q}`);
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      toast.error('No se pudieron cargar los tickets recuperados');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const formatCliente = (t: TicketRow) =>
    `${t.clientes.nombre} ${t.clientes.apellido_paterno} ${t.clientes.apellido_materno || ''}`.trim();

  return (
    <AdminOnlyGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Tickets recuperados</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Registro histórico de tickets físicos. Solo administradores.
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/tickets-recuperados/nuevo')}>
            <HiPlus className="mr-2 h-5 w-5" />
            Registrar ticket
          </Button>
        </div>

        <div className="relative mb-6 max-w-md">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Buscar por ticket, cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ticket</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Cliente</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Equipo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Recepción</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay tickets recuperados registrados.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{t.numero_ticket}</td>
                    <td className="px-4 py-3">{formatCliente(t)}</td>
                    <td className="px-4 py-3">
                      {t.modelos.marcas.nombre} {t.modelos.nombre}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(t.fecha_recepcion).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          t.entregado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {t.estatus_reparacion.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.presupuestos ? `$${t.presupuestos.total.toFixed(0)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/tickets-recuperados/${t.id}/edit`}>
                            <HiPencilAlt className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/tickets/${t.id}`}>Ver</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminOnlyGuard>
  );
}
