import { Metadata } from 'next';
import AdminLayout from '@/components/adminLayout';
import VentaProductosForm from '@/components/venta-productos/VentaProductosForm';

export const metadata: Metadata = {
  title: 'Venta de Productos - YAAVS',
  description: 'Sistema de venta de productos'
};

export default function VentaProductosPage() {
  return (
    <AdminLayout>
      <VentaProductosForm />
    </AdminLayout>
  );
} 