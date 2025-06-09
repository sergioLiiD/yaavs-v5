'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  telefonoCelular: z.string().min(1, 'El teléfono celular es requerido'),
  telefonoContacto: z.string().optional(),
  email: z.string().email('Email inválido'),
  rfc: z.string().optional(),
  calle: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  fuenteReferencia: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export default function NewClientePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const onSubmit = async (data: ClienteFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear el cliente');
      }

      toast.success('Cliente creado exitosamente');
      router.push('/repair-point/clientes');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nuevo Cliente</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              {...register('nombre')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido Paterno *
            </label>
            <input
              type="text"
              {...register('apellidoPaterno')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.apellidoPaterno && (
              <p className="mt-1 text-sm text-red-600">
                {errors.apellidoPaterno.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido Materno
            </label>
            <input
              type="text"
              {...register('apellidoMaterno')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.apellidoMaterno && (
              <p className="mt-1 text-sm text-red-600">
                {errors.apellidoMaterno.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono Celular *
            </label>
            <input
              type="tel"
              {...register('telefonoCelular')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.telefonoCelular && (
              <p className="mt-1 text-sm text-red-600">
                {errors.telefonoCelular.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              {...register('telefonoContacto')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.telefonoContacto && (
              <p className="mt-1 text-sm text-red-600">
                {errors.telefonoContacto.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo Electrónico *
            </label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              RFC
            </label>
            <input
              type="text"
              {...register('rfc')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FEBF19] focus:ring-[#FEBF19]"
            />
            {errors.rfc && (
              <p className="mt-1 text-sm text-red-600">{errors.rfc.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#FEBF19] text-gray-900 rounded-md hover:bg-[#FEBF19]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEBF19] disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
} 