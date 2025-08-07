'use client';

import React, { useState, useEffect } from 'react';
import { FiltrosReporte } from '@/services/reporteService';
import { Calendar, Filter } from 'lucide-react';

interface FiltrosReporteProps {
  filtros: FiltrosReporte;
  onFiltrosChange: (filtros: FiltrosReporte) => void;
}

export default function FiltrosReporte({ filtros, onFiltrosChange }: FiltrosReporteProps) {
  const [fechaInicio, setFechaInicio] = useState(filtros.fechaInicio);
  const [fechaFin, setFechaFin] = useState(filtros.fechaFin);
  const [tipoPeriodo, setTipoPeriodo] = useState(filtros.tipoPeriodo);

  const actualizarFiltros = () => {
    onFiltrosChange({
      ...filtros,
      fechaInicio,
      fechaFin,
      tipoPeriodo
    });
  };

  const establecerPeriodo = (periodo: 'dia' | 'semana' | 'mes' | 'personalizado') => {
    const hoy = new Date();
    let inicio = new Date();
    let fin = new Date();

    switch (periodo) {
      case 'dia':
        inicio = fin = hoy;
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        inicio = inicioSemana;
        fin = hoy;
        break;
      case 'mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        fin = hoy;
        break;
      case 'personalizado':
        // Mantener las fechas actuales
        return;
    }

    setFechaInicio(inicio.toISOString().split('T')[0]);
    setFechaFin(fin.toISOString().split('T')[0]);
    setTipoPeriodo(periodo);
  };

  useEffect(() => {
    actualizarFiltros();
  }, [fechaInicio, fechaFin, tipoPeriodo]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter size={20} className="text-[#FEBF19]" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros del Reporte</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={tipoPeriodo}
            onChange={(e) => establecerPeriodo(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:border-[#FEBF19]"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="personalizado">Período personalizado</option>
          </select>
        </div>

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha inicio
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:border-[#FEBF19]"
            />
          </div>
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha fin
          </label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FEBF19] focus:border-[#FEBF19]"
            />
          </div>
        </div>

        {/* Botón de aplicar */}
        <div className="flex items-end">
          <button
            onClick={actualizarFiltros}
            className="w-full bg-[#FEBF19] text-white py-2 px-4 rounded-md hover:bg-[#E6AC17] transition-colors"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Información del período */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Período seleccionado:</span> {fechaInicio} - {fechaFin}
        </p>
      </div>
    </div>
  );
} 