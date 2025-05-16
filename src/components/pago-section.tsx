'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

interface PagoSectionProps {
  ticketId: number;
  onUpdate?: () => void;
}

interface Pago {
  id: number;
  monto: number;
  fecha: string;
  concepto: string;
  metodoPago: string;
}

export function PagoSection({ ticketId, onUpdate }: PagoSectionProps) {
  const [anticipo, setAnticipo] = useState(0);
  // const [cuponDescuento, setCuponDescuento] = useState('');
  // const [descuento, setDescuento] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'PAGO_ENTREGA'>('EFECTIVO');
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

  const calcularTotal = () => {
    if (!presupuesto) return 0;
    const subtotal = presupuesto.subtotal;
    // const totalConDescuento = subtotal - descuento;
    const iva = subtotal * 0.16;
    return subtotal + iva;
  };

  const calcularSaldo = () => {
    if (!presupuesto) return 0;
    const total = calcularTotal();
    const pagosRealizados = pagos?.reduce((sum: number, pago: Pago) => sum + pago.monto, 0) || 0;
    return total - pagosRealizados;
  };

  const handleGuardarPago = async () => {
    try {
      setIsLoading(true);
      const total = calcularTotal();
      const saldo = calcularSaldo();
      const anticipoMinimo = total * 0.5;

      if (anticipo < anticipoMinimo) {
        toast.error(`El anticipo debe ser al menos el 50% del total ($${anticipoMinimo.toFixed(2)})`);
        return;
      }

      const dataToSend = {
        total,
        anticipo,
        saldo,
        cuponDescuento: null,
        descuento: 0,
        metodoPago,
      };

      console.log('Enviando datos:', dataToSend);

      const response = await fetch(`/api/tickets/${ticketId}/pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error al guardar el pago: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);

      toast.success('Pago guardado correctamente');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error al guardar pago:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el pago');
    } finally {
      setIsLoading(false);
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
      <Card>
        <CardHeader>
          <CardTitle>Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Método de pago */}
            <div className="space-y-2">
              <Label>Método de Pago</Label>
              <Select
                value={metodoPago}
                onValueChange={(value: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'PAGO_ENTREGA') => 
                  setMetodoPago(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="PAGO_ENTREGA">Pago a la entrega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cupón de descuento - Comentado temporalmente
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cupón de Descuento</Label>
                <Input
                  type="text"
                  value={cuponDescuento}
                  onChange={(e) => setCuponDescuento(e.target.value)}
                  placeholder="Ingrese cupón de descuento"
                />
              </div>
              <div className="space-y-2">
                <Label>Descuento</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
            */}

            {/* Anticipo */}
            <div className="space-y-2">
              <Label>Anticipo (50% recomendado)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={anticipo}
                onChange={(e) => setAnticipo(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            {/* Resumen de pagos */}
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(calcularTotal() / 1.16).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span>${(calcularTotal() - calcularTotal() / 1.16).toFixed(2)}</span>
              </div>
              {/* Descuento - Comentado temporalmente
              {descuento > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-${descuento.toFixed(2)}</span>
                </div>
              )}
              */}
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${calcularTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pagado:</span>
                <span>${(pagos?.reduce((sum: number, pago: Pago) => sum + pago.monto, 0) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-red-600">
                <span>Saldo pendiente:</span>
                <span>${calcularSaldo().toFixed(2)}</span>
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="flex justify-end">
              <Button
                onClick={handleGuardarPago}
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Guardar Pago'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de pagos */}
      {pagos && pagos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pagos.map((pago: Pago) => (
                <div key={pago.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{pago.concepto}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(pago.fecha), "PPP 'a las' p", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-medium">${pago.monto.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{pago.metodoPago}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePago(pago)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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