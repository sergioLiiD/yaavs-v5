'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HiSave } from 'react-icons/hi';
import { Checkbox } from '@/components/ui/checkbox';

interface PagoSectionProps {
  ticketId: number;
  onUpdate?: () => void;
}

interface Pago {
  id: number;
  ticketId: number;
  monto: number;
  metodo: string;
  referencia?: string;
  createdAt: string;
  updatedAt: string;
}

export function PagoSection({ ticketId, onUpdate }: PagoSectionProps) {
  const queryClient = useQueryClient();
  const [anticipo, setAnticipo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<string>('EFECTIVO');
  const [pagoToDelete, setPagoToDelete] = useState<Pago | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: presupuesto } = useQuery({
    queryKey: ['presupuesto', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/presupuesto`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar presupuesto');
      }
      const data = await response.json();
      return data;
    },
  });

  const { data: pagos } = useQuery({
    queryKey: ['pagos', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/pagos`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar pagos');
      }
      const data = await response.json();
      return data;
    },
  });

  const calcularSubtotal = () => {
    if (!presupuesto) return 0;
    return presupuesto.total / 1.16;
  };

  const calcularIVA = () => {
    if (!presupuesto) return 0;
    return calcularSubtotal() * 0.16;
  };

  const calcularTotal = () => {
    if (!presupuesto) return 0;
    return presupuesto.total;
  };

  const calcularSaldo = () => {
    if (!presupuesto) return 0;
    const total = calcularTotal();
    const totalPagado = pagos?.reduce((sum: number, pago: Pago) => sum + pago.monto, 0) || 0;
    return total - totalPagado;
  };

  const calcularTotalPagado = () => {
    return pagos?.reduce((sum: number, pago: Pago) => sum + pago.monto, 0) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    try {
      const total = calcularTotal();
      const response = await fetch(`/api/tickets/${ticketId}/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          anticipo,
          metodoPago,
          total,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el pago');
      }

      // Recargar los datos
      await queryClient.invalidateQueries({ queryKey: ['pagos', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['presupuesto', ticketId] });

      // Limpiar el formulario
      setAnticipo(0);
      setMetodoPago('EFECTIVO');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al registrar el pago');
    }
  };

  const handleDeletePago = async (pago: Pago) => {
    setPagoToDelete(pago);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePago = async () => {
    if (!pagoToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}/pagos/${pagoToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el pago');
      }

      toast.success('Pago eliminado correctamente');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el pago');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setPagoToDelete(null);
    }
  };

  if (!presupuesto) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Primero debe crear un presupuesto para poder procesar el pago.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Registrar Pago</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monto del Anticipo
            </label>
            <input
              type="number"
              value={anticipo}
              onChange={(e) => setAnticipo(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19] px-4 py-3"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FEBF19] hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
          >
            Registrar Pago
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Pagos</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-lg font-medium">${calcularSubtotal().toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IVA (16%)</p>
              <p className="text-lg font-medium">${calcularIVA().toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-medium">${calcularTotal().toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagado</p>
              <p className="text-lg font-medium">${calcularTotalPagado().toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Saldo Pendiente</p>
              <p className="text-lg font-medium">${calcularSaldo().toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos</h3>
        <div className="space-y-4">
          {pagos?.map((pago: Pago) => (
            <div key={pago.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">${pago.monto.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{pago.metodo}</p>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(pago.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePago}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 