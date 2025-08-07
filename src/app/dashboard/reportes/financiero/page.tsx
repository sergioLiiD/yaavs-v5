import { Metadata } from 'next';
import ReporteFinanciero from '@/components/reportes/financiero/ReporteFinanciero';
import RouteGuard from '@/components/route-guard';

export const metadata: Metadata = {
  title: 'Reporte Financiero - YAAVS',
  description: 'Análisis de ingresos, egresos y balance financiero'
};

export default function ReporteFinancieroPage() {
  return (
    <RouteGuard requiredPermissions={['REPORTS_VIEW']} section="Reporte Financiero">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reporte Financiero</h1>
          <p className="text-gray-600">Análisis completo de ingresos, egresos y balance</p>
        </div>
        
        <ReporteFinanciero />
      </div>
    </RouteGuard>
  );
} 