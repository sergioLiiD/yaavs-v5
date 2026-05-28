import { Metadata } from 'next';
import ReportePiezasUsadas from '@/components/reportes/piezas-usadas/ReportePiezasUsadas';
import RouteGuard from '@/components/route-guard';

export const metadata: Metadata = {
  title: 'Reporte por Piezas Usadas - YAAVS',
  description: 'Ingresos y egresos por pieza en tickets entregados',
};

export default function ReportePiezasUsadasPage() {
  return (
    <RouteGuard requiredPermissions={['REPORTS_VIEW']} section="Reporte por Piezas Usadas">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reporte por Piezas Usadas</h1>
          <p className="text-gray-600">
            Ingresos y egresos desglosados por producto en tickets entregados
          </p>
        </div>

        <ReportePiezasUsadas />
      </div>
    </RouteGuard>
  );
}
