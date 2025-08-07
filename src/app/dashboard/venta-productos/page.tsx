import { Metadata } from 'next';
import VentaProductosForm from '@/components/venta-productos/VentaProductosForm';
import RouteGuard from '@/components/route-guard';

export const metadata: Metadata = {
  title: 'Venta de Productos - YAAVS',
  description: 'Sistema de venta de productos'
};

export default function VentaProductosPage() {
  return (
    <RouteGuard requiredPermissions={['SALES_VIEW']} section="Venta de Productos">
      <VentaProductosForm />
    </RouteGuard>
  );
} 