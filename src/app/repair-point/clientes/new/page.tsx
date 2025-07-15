'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HiArrowLeft } from 'react-icons/hi';

interface FormData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  telefonoCelular: string;
  telefonoContacto: string;
}

export default function NewClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    telefonoCelular: '',
    telefonoContacto: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/repair-point/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          telefono: formData.telefonoCelular // Mapear telefonoCelular a telefono para la API
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el cliente');
      }

      router.push('/repair-point/clientes');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <HiArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellidoPaterno">Apellido Paterno</Label>
            <Input
              id="apellidoPaterno"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apellidoMaterno">Apellido Materno</Label>
            <Input
              id="apellidoMaterno"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonoCelular">Teléfono</Label>
            <Input
              id="telefonoCelular"
              name="telefonoCelular"
              type="tel"
              value={formData.telefonoCelular}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonoContacto">Teléfono de Contacto</Label>
            <Input
              id="telefonoContacto"
              name="telefonoContacto"
              type="tel"
              value={formData.telefonoContacto}
              onChange={handleChange}
              placeholder="Teléfono para comunicarnos cuando tengamos su dispositivo"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
} 