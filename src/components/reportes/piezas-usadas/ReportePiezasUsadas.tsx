'use client';

import React, { useState, useEffect } from 'react';
import FiltrosReporte from '@/components/reportes/financiero/FiltrosReporte';
import {
  FiltrosReporte as IFiltrosReporte,
  ReportePiezasUsadas,
  ReportePiezasUsadasService,
} from '@/services/reporteService';
import { Download, RefreshCw, Package } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

export default function ReportePiezasUsadas() {
  const hoy = new Date();
  const inicioAnio = new Date(hoy.getFullYear(), 0, 1);

  const [filtros, setFiltros] = useState<IFiltrosReporte>({
    fechaInicio: inicioAnio.toISOString().split('T')[0],
    fechaFin: hoy.toISOString().split('T')[0],
    tipoPeriodo: 'personalizado',
  });

  const [reporte, setReporte] = useState<ReportePiezasUsadas | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'pieza' | 'mes'>('pieza');
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('');

  const cargarReporte = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ReportePiezasUsadasService.obtener({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
      });
      setReporte(data);
      if (data.porMes.length > 0) {
        setMesSeleccionado(data.porMes[0].mes);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [filtros]);

  const handleExportar = async () => {
    try {
      const blob = await ReportePiezasUsadasService.exportarExcel({
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-piezas-usadas-${filtros.fechaInicio}-${filtros.fechaFin}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('Error al exportar el reporte');
    }
  };

  const piezasMesActual =
    reporte?.porMes.find((m) => m.mes === mesSeleccionado)?.piezas ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reporte por Piezas Usadas</h2>
          <p className="text-sm text-gray-600">
            Tickets entregados · Período: {filtros.fechaInicio} — {filtros.fechaFin}
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
            disabled={loading || !reporte}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FEBF19] text-white rounded-md hover:bg-[#E6AC17] transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
        Solo incluye tickets <strong>entregados</strong> con reparación terminada.
        Los datos se agrupan por <strong>pieza/producto usado</strong>; la columna de categoría en el Excel queda vacía para que la clasifiquen ustedes (Display, Batería, etc.).
      </div>

      <FiltrosReporte filtros={filtros} onFiltrosChange={setFiltros} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEBF19]" />
          <span className="ml-2 text-gray-600">Cargando reporte...</span>
        </div>
      )}

      {reporte && !loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Tickets entregados', value: reporte.resumen.totalTickets },
              { label: 'Piezas distintas', value: reporte.resumen.totalPiezasDistintas },
              { label: 'Cantidad total', value: reporte.resumen.totalCantidadUsada },
              { label: 'Ingresos', value: formatCurrency(reporte.resumen.totalIngresos) },
              { label: 'Egresos', value: formatCurrency(reporte.resumen.totalEgresos) },
              { label: 'Margen', value: formatCurrency(reporte.resumen.margen) },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setVistaActiva('pieza')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                vistaActiva === 'pieza'
                  ? 'border-[#FEBF19] text-[#FEBF19]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Por pieza (total)
            </button>
            <button
              onClick={() => setVistaActiva('mes')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                vistaActiva === 'mes'
                  ? 'border-[#FEBF19] text-[#FEBF19]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Por mes
            </button>
          </div>

          {vistaActiva === 'mes' && reporte.porMes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reporte.porMes.map((m) => (
                <button
                  key={m.mes}
                  onClick={() => setMesSeleccionado(m.mes)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    mesSeleccionado === m.mes
                      ? 'bg-[#FEBF19] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {m.mesLabel} ({m.totalTickets})
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {(vistaActiva === 'pieza' ? reporte.porPieza : piezasMesActual).length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No hay piezas usadas en tickets entregados para este período</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca / Modelo</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"># Tickets</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Egresos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(vistaActiva === 'pieza' ? reporte.porPieza : piezasMesActual).map((p) => (
                      <tr key={p.productoId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{p.sku}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.nombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {[p.marca, p.modelo].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{p.numTickets}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">{p.cantidadUsada}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-700">{formatCurrency(p.ingresos)}</td>
                        <td className="px-4 py-3 text-sm text-right text-red-700">{formatCurrency(p.egresos)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(p.margen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
