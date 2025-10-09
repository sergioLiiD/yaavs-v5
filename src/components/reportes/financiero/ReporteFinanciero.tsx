'use client';

import React, { useState, useEffect } from 'react';
import FiltrosReporte from './FiltrosReporte';
import ResumenFinanciero from './ResumenFinanciero';
import DetalleIngresos from './DetalleIngresos';
import DetalleEgresos from './DetalleEgresos';
import GraficosReporte from './GraficosReporte';
import ExportarReporte from './ExportarReporte';
import CorteCaja from './CorteCaja';
import { ReporteService, FiltrosReporte as IFiltrosReporte, ResumenFinanciero as IResumenFinanciero } from '@/services/reporteService';
import { Download, RefreshCw } from 'lucide-react';

export default function ReporteFinanciero() {
  const [filtros, setFiltros] = useState<IFiltrosReporte>({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipoPeriodo: 'dia'
  });
  
  const [resumen, setResumen] = useState<IResumenFinanciero | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReporteService.obtenerResumenFinanciero(filtros);
      setResumen(data);
    } catch (error: any) {
      console.error('Error al cargar reporte:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [filtros]);

  const handleFiltrosChange = (nuevosFiltros: IFiltrosReporte) => {
    setFiltros(nuevosFiltros);
  };

  const handleExportar = async () => {
    try {
      const blob = await ReporteService.exportarExcel(filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-financiero-${filtros.fechaInicio}-${filtros.fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Error al exportar:', error);
      alert('Error al exportar el reporte');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reporte Financiero</h2>
          <p className="text-sm text-gray-600">
            Período: {filtros.fechaInicio} - {filtros.fechaFin}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={cargarReporte}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={handleExportar}
            disabled={loading || !resumen}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FEBF19] text-white rounded-md hover:bg-[#E6AC17] transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <FiltrosReporte 
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-600">
              <p className="font-medium">Error al cargar el reporte</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEBF19]"></div>
          <span className="ml-2 text-gray-600">Cargando reporte...</span>
        </div>
      )}

      {/* Contenido del reporte */}
      {resumen && !loading && (
        <div className="space-y-6">
          {/* Resumen financiero */}
          <ResumenFinanciero resumen={resumen} />
          
          {/* Gráficos */}
          <GraficosReporte filtros={filtros} />
          
          {/* Detalles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DetalleIngresos filtros={filtros} />
            <DetalleEgresos filtros={filtros} />
          </div>

          {/* Corte de Caja */}
          <CorteCaja filtros={filtros} />
        </div>
      )}
    </div>
  );
} 