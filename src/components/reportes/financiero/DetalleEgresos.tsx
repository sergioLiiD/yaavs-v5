'use client';

import React, { useState, useEffect } from 'react';
import { ReporteService, FiltrosReporte, DetalleEgreso } from '@/services/reporteService';
import { TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface DetalleEgresosProps {
  filtros: FiltrosReporte;
}

export default function DetalleEgresos({ filtros }: DetalleEgresosProps) {
  const [egresos, setEgresos] = useState<DetalleEgreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    cargarEgresos();
  }, [filtros]);

  const cargarEgresos = async () => {
    try {
      setLoading(true);
      const data = await ReporteService.obtenerDetalleEgresos(filtros);
      setEgresos(data);
    } catch (error) {
      console.error('Error al cargar egresos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalEgresos = egresos.reduce((sum, egreso) => sum + egreso.monto, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-full">
              <TrendingDown className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detalle de Egresos</h3>
              <p className="text-sm text-gray-600">
                {egresos.length} operaciones • Total: {formatCurrency(totalEgresos)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <span className="text-sm font-medium">
              {expanded ? 'Ocultar' : 'Ver'} detalles
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FEBF19] mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Cargando egresos...</p>
        </div>
      )}

      {!loading && expanded && (
        <div className="p-6">
          {egresos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay egresos en el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {egresos.map((egreso) => (
                <div key={egreso.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Compra de Insumos
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(egreso.fecha)}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-red-600">
                      {formatCurrency(egreso.monto)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Proveedor:</span>
                      <span className="font-medium">{egreso.proveedor}</span>
                    </div>
                    
                    {egreso.productos && egreso.productos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Productos:</p>
                        <ul className="space-y-1">
                          {egreso.productos.map((producto, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              • {producto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {egreso.notas && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Notas:</p>
                        <p className="text-sm text-gray-600">{egreso.notas}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 