'use client';

import React, { useState, useEffect } from 'react';
import { ReporteService, FiltrosReporte, DatosGrafico } from '@/services/reporteService';
import { BarChart3, TrendingUp } from 'lucide-react';

interface GraficosReporteProps {
  filtros: FiltrosReporte;
}

export default function GraficosReporte({ filtros }: GraficosReporteProps) {
  const [datosGrafico, setDatosGrafico] = useState<DatosGrafico | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatosGrafico();
  }, [filtros]);

  const cargarDatosGrafico = async () => {
    try {
      setLoading(true);
      const data = await ReporteService.obtenerDatosGrafico(filtros);
      setDatosGrafico(data);
    } catch (error) {
      console.error('Error al cargar datos del gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-full">
          <BarChart3 className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análisis Gráfico</h3>
          <p className="text-sm text-gray-600">Tendencias de ingresos y egresos</p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEBF19]"></div>
          <span className="ml-2 text-gray-600">Cargando gráficos...</span>
        </div>
      )}

      {!loading && datosGrafico && (
        <div className="space-y-6">
          {/* Gráfico de barras */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Evolución por Días</h4>
            <div className="h-64 flex items-end justify-center space-x-2">
              {datosGrafico.labels.map((label, index) => {
                const ingresos = datosGrafico.datasets.find(d => d.label === 'Ingresos')?.data[index] || 0;
                const egresos = datosGrafico.datasets.find(d => d.label === 'Egresos')?.data[index] || 0;
                const maxValue = Math.max(...datosGrafico.datasets.flatMap(d => d.data));
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex space-x-1">
                      <div 
                        className="w-8 bg-green-500 rounded-t"
                        style={{ 
                          height: `${maxValue > 0 ? (ingresos / maxValue) * 200 : 0}px` 
                        }}
                        title={`Ingresos: $${ingresos.toLocaleString()}`}
                      ></div>
                      <div 
                        className="w-8 bg-red-500 rounded-t"
                        style={{ 
                          height: `${maxValue > 0 ? (egresos / maxValue) * 200 : 0}px` 
                        }}
                        title={`Egresos: $${egresos.toLocaleString()}`}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Ingresos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Egresos</span>
              </div>
            </div>
          </div>

          {/* Gráfico de líneas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Tendencia de Balance</h4>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-48 border-l border-b border-gray-300 relative">
                {datosGrafico.datasets.find(d => d.label === 'Balance')?.data.map((value, index) => {
                  const prevValue = index > 0 ? datosGrafico.datasets.find(d => d.label === 'Balance')?.data[index - 1] || 0 : 0;
                  const x = (index / (datosGrafico.labels.length - 1)) * 100;
                  const y = 50 - (value / Math.max(...datosGrafico.datasets.find(d => d.label === 'Balance')?.data || [1])) * 40;
                  const prevX = index > 0 ? ((index - 1) / (datosGrafico.labels.length - 1)) * 100 : 0;
                  const prevY = index > 0 ? 50 - (prevValue / Math.max(...datosGrafico.datasets.find(d => d.label === 'Balance')?.data || [1])) * 40 : y;
                  
                  return (
                    <g key={index}>
                      {index > 0 && (
                        <line
                          x1={`${prevX}%`}
                          y1={`${prevY}%`}
                          x2={`${x}%`}
                          y2={`${y}%`}
                          stroke="#FEBF19"
                          strokeWidth="2"
                        />
                      )}
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="4"
                        fill="#FEBF19"
                      />
                    </g>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#FEBF19] rounded-full"></div>
                <span className="text-sm text-gray-600">Balance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !datosGrafico && (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No hay datos suficientes para mostrar gráficos</p>
        </div>
      )}
    </div>
  );
} 