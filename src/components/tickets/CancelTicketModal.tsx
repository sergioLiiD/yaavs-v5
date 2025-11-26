'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface CancelTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number;
  ticketNumber: string;
  onSuccess?: () => void;
}

export function CancelTicketModal({
  isOpen,
  onClose,
  ticketId,
  ticketNumber,
  onSuccess
}: CancelTicketModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Verificar que el usuario sea administrador
  const isAdmin = session?.user?.role === 'ADMINISTRADOR';

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!motivo.trim()) {
      toast.error('Por favor, proporciona un motivo de cancelación');
      return;
    }

    if (!isAdmin) {
      toast.error('Solo los administradores pueden cancelar tickets');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          motivoCancelacion: motivo.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cancelar el ticket');
      }

      toast.success(
        data.devoluciones?.total > 0
          ? `Ticket cancelado. Se crearon ${data.devoluciones.total} registro(s) de devolución pendiente por $${data.devoluciones.montoTotal.toFixed(2)}.`
          : 'Ticket cancelado exitosamente.'
      );

      setMotivo('');
      onClose();
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error al cancelar ticket:', error);
      toast.error(error.message || 'Error al cancelar el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600">Acceso Denegado</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            Solo los administradores pueden cancelar tickets.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Cancelar Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">
            ¿Estás seguro de que deseas cancelar el ticket <strong>#{ticketNumber}</strong>?
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Esta acción no se puede deshacer. Si el ticket tiene pagos registrados, 
            se crearán registros de devolución pendiente.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Describe el motivo de la cancelación..."
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoading || !motivo.trim()}
            >
              {isLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

