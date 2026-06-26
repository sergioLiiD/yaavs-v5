'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ClienteListItem,
  mapClienteFromApi,
  parseClienteSearchQuery,
} from '@/lib/cliente-mapper';

interface ExistingClientConflict {
  id: number;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
}

interface NuevoClienteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (cliente: ClienteListItem) => void;
  initialSearch?: string;
}

const emptyForm = {
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  telefonoCelular: '',
  email: '',
};

export function NuevoClienteModal({
  open,
  onOpenChange,
  onSuccess,
  initialSearch = '',
}: NuevoClienteModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateClient, setDuplicateClient] = useState<ExistingClientConflict | null>(null);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDuplicateClient(null);
    setFormData({
      ...emptyForm,
      ...parseClienteSearchQuery(initialSearch),
    });
  }, [open, initialSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setDuplicateClient(null);
  };

  const handleUseExistingClient = () => {
    if (!duplicateClient) return;
    onSuccess({
      id: duplicateClient.id,
      nombre: duplicateClient.nombre,
      apellidoPaterno: '',
      apellidoMaterno: '',
      telefonoCelular: duplicateClient.telefono ?? '',
      email: duplicateClient.email,
    });
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDuplicateClient(null);

    if (!formData.nombre.trim() || !formData.apellidoPaterno.trim() || !formData.telefonoCelular.trim()) {
      setError('Nombre, apellido paterno y teléfono celular son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nombre: formData.nombre.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim() || undefined,
        telefonoCelular: formData.telefonoCelular.trim(),
        email: formData.email.trim() || undefined,
      };

      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.existingClient) {
          setDuplicateClient(data.existingClient);
        }
        setError(data.message || data.error || 'Error al crear el cliente');
        return;
      }

      onSuccess(mapClienteFromApi(data));
      onOpenChange(false);
    } catch {
      setError('Error al crear el cliente. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo cliente</DialogTitle>
          <DialogDescription>
            Captura los datos mínimos para continuar con el ticket. Podrás completar el perfil después en Clientes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && !duplicateClient && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {duplicateClient && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900 space-y-2">
              <p>{error}</p>
              <Button type="button" size="sm" onClick={handleUseExistingClient}>
                Usar cliente existente: {duplicateClient.nombre}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellidoPaterno">Apellido paterno *</Label>
            <Input
              id="apellidoPaterno"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              placeholder="Apellido paterno"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellidoMaterno">Apellido materno</Label>
            <Input
              id="apellidoMaterno"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              placeholder="Apellido materno (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonoCelular">Teléfono celular *</Label>
            <Input
              id="telefonoCelular"
              name="telefonoCelular"
              type="tel"
              value={formData.telefonoCelular}
              onChange={handleChange}
              placeholder="Teléfono celular"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo electrónico (opcional)"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
