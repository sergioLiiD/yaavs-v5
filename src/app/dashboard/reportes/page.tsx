import { Metadata } from 'next';
import ReportesTabs from '@/components/reportes/ReportesTabs';
import RouteGuard from '@/components/route-guard';

export const metadata: Metadata = {
  title: 'Reportes - YAAVS',
  description: 'Sistema de reportes y análisis'
};

export default function ReportesPage() {
  return (
    <RouteGuard requiredPermissions={['REPORTS_VIEW']} section="Reportes">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y reportes del sistema</p>
        </div>
        
        <ReportesTabs />
      </div>
    </RouteGuard>
  );
} 