'use client';

import React, { useState, useEffect } from 'react';
import { ReporteService, FiltrosReporte, DetalleIngreso } from '@/services/reporteService';
import { TrendingUp, Eye, ChevronDown, ChevronUp } from 'lucide-react';

interface DetalleIngresosProps {
  filtros: FiltrosReporte;
}

export default function DetalleIngresos({ filtros }: DetalleIngresosProps) {
  const [ingresos, setIngresos] = useState<DetalleIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    cargarIngresos();
  }, [filtros]);

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      const data = await ReporteService.obtenerDetalleIngresos(filtros);
      setIngresos(data);
    } catch (error) {
      console.error('Error al cargar ingresos:', error);
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

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'venta_producto':
        return 'Venta de Producto';
      case 'servicio_reparacion':
        return 'Pago de Reparación';
      default:
        return tipo;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venta_producto':
        return 'bg-blue-100 text-blue-800';
      case 'servicio_reparacion':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Detalle de Ingresos</h3>
              <p className="text-sm text-gray-600">
                {ingresos.length} operaciones • Total: {formatCurrency(totalIngresos)}
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
          <p className="text-sm text-gray-600 mt-2">Cargando ingresos...</p>
        </div>
      )}

      {!loading && expanded && (
        <div className="p-6">
          {ingresos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay ingresos en el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ingresos.map((ingreso) => (
                <div key={ingreso.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(ingreso.tipo)}`}>
                        {getTipoLabel(ingreso.tipo)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatDate(ingreso.fecha)}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(ingreso.monto)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{ingreso.cliente}</span>
                    </div>
                    
                    {ingreso.metodoPago && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Método de pago:</span>
                        <span className="font-medium">{ingreso.metodoPago}</span>
                      </div>
                    )}
                    
                    {ingreso.referencia && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Referencia:</span>
                        <span className="font-medium">{ingreso.referencia}</span>
                      </div>
                    )}
                    
                    {ingreso.detalles && ingreso.detalles.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Detalles:</p>
                        <ul className="space-y-1">
                          {ingreso.detalles.map((detalle, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              • {detalle}
                            </li>
                          ))}
                        </ul>
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