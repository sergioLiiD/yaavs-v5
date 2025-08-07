import { Metadata } from 'next';
import VentaProductosPageContent from '@/components/venta-productos/VentaProductosPageContent';
import RouteGuard from '@/components/route-guard';

export const metadata: Metadata = {
  title: 'Venta de Productos - YAAVS',
  description: 'Sistema de venta de productos'
};

export default function VentaProductosPage() {
  return (
    <RouteGuard requiredPermissions={['SALES_VIEW']} section="Venta de Productos">
      <VentaProductosPageContent />
    </RouteGuard>
  );
} 