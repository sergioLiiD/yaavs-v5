'use client';

import React from 'react';
import { FiltrosReporte } from '@/services/reporteService';
import { Download, FileSpreadsheet } from 'lucide-react';

interface ExportarReporteProps {
  filtros: FiltrosReporte;
  onExportar: () => void;
  loading?: boolean;
}

export default function ExportarReporte({ filtros, onExportar, loading = false }: ExportarReporteProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-[#FEBF19] p-2 rounded-full">
          <FileSpreadsheet className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Exportar Reporte</h3>
          <p className="text-sm text-gray-600">Descargar reporte en formato Excel</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Información del reporte:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Período:</span>
              <p className="font-medium">{filtros.fechaInicio} - {filtros.fechaFin}</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-medium capitalize">{filtros.tipoPeriodo}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">El archivo Excel incluirá:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Resumen ejecutivo con totales</li>
            <li>• Detalle completo de ingresos por ventas y servicios</li>
            <li>• Detalle completo de egresos por compras</li>
            <li>• Comparativas con el mes anterior</li>
            <li>• Gráficos de tendencias</li>
          </ul>
        </div>

        <button
          onClick={onExportar}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-[#FEBF19] text-white py-3 px-4 rounded-md hover:bg-[#E6AC17] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generando archivo...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Exportar a Excel</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
} 