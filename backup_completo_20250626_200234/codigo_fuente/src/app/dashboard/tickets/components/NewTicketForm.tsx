import React, { useState } from 'react';
import { useRouter } from 'next/router';

const NewTicketForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clienteId: '',
    tipoServicioId: '',
    modeloId: '',
    descripcionProblema: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar campos requeridos
      if (!formData.clienteId || !formData.tipoServicioId || !formData.modeloId || !formData.descripcionProblema) {
        setError('Por favor complete todos los campos requeridos');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el ticket');
      }

      const data = await response.json();
      router.push('/dashboard/tickets');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear el ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default NewTicketForm; 