import { Metadata } from 'next';
import { NuevoTicketForm } from '@/components/cliente/NuevoTicketForm';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Nuevo Ticket | YAAVS',
  description: 'Crea un nuevo ticket de servicio',
};

export default function NuevoTicketPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Nuevo Ticket de Servicio</h1>
        <NuevoTicketForm />
      </div>
      <Toaster />
    </div>
  );
} 