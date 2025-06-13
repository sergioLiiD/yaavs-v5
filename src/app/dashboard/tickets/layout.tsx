import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tickets | arregla.mx',
  description: 'Gestión de tickets de reparación',
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 