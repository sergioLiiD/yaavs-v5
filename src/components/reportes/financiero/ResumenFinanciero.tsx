'use client';

import React from 'react';
import { ResumenFinanciero as IResumenFinanciero } from '@/services/reporteService';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Ticket, Calculator } from 'lucide-react';

interface ResumenFinancieroProps {
  resumen: IResumenFinanciero;
}

export default function ResumenFinanciero({ resumen }: ResumenFinancieroProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatPercentage = (amount: number) => {
    return `${amount >= 0 ? '+' : ''}${amount.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {/* Ingresos totales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(resumen.ingresos.total)}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
        
        {/* Comparativa con mes anterior */}
        <div className="mt-4 flex items-center space-x-2">
          {resumen.comparativaMesAnterior.ingresos > 0 ? (
            <ArrowUpRight size={16} className="text-green-500" />
          ) : (
            <ArrowDownRight size={16} className="text-red-500" />
          )}
          <span className={`text-sm ${
            resumen.comparativaMesAnterior.ingresos > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercentage(resumen.comparativaMesAnterior.porcentajeCambio)} vs mes anterior
          </span>
        </div>
      </div>

      {/* Egresos totales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Egresos Totales</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(resumen.egresos.total)}
            </p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>
        
        {/* Comparativa con mes anterior */}
        <div className="mt-4 flex items-center space-x-2">
          {resumen.comparativaMesAnterior.egresos < 0 ? (
            <ArrowUpRight size={16} className="text-green-500" />
          ) : (
            <ArrowDownRight size={16} className="text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            Comparativa con mes anterior
          </span>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Balance</p>
            <p className={`text-2xl font-bold ${
              resumen.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(resumen.balance)}
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            resumen.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <DollarSign className={resumen.balance >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
          </div>
        </div>
        
        {/* Comparativa con mes anterior */}
        <div className="mt-4 flex items-center space-x-2">
          {resumen.comparativaMesAnterior.balance > 0 ? (
            <ArrowUpRight size={16} className="text-green-500" />
          ) : (
            <ArrowDownRight size={16} className="text-red-500" />
          )}
          <span className={`text-sm ${
            resumen.comparativaMesAnterior.balance > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            Balance vs mes anterior
          </span>
        </div>
      </div>

      {/* Margen de ganancia */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Margen</p>
            <p className={`text-2xl font-bold ${
              resumen.ingresos.total > 0 ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {resumen.ingresos.total > 0 
                ? `${((resumen.balance / resumen.ingresos.total) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <DollarSign className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {formatCurrency(resumen.ingresos.total)} ingresos
          </p>
          <p className="text-sm text-gray-600">
            {formatCurrency(resumen.egresos.total)} egresos
          </p>
        </div>
      </div>

      {/* Total de tickets en el periodo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
            <p className="text-2xl font-bold text-indigo-600">
              {resumen.totalTicketsEnPeriodo?.toLocaleString('es-MX') ?? 0}
            </p>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full">
            <Ticket className="text-indigo-600" size={24} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Ventas + tickets con pagos en el periodo
          </p>
        </div>
      </div>

      {/* Costo promedio de ticket */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Costo Promedio Ticket</p>
            <p className={`text-2xl font-bold ${
              resumen.totalTicketsEnPeriodo > 0 ? 'text-amber-600' : 'text-gray-600'
            }`}>
              {resumen.totalTicketsEnPeriodo > 0
                ? formatCurrency(resumen.costoPromedioTicket ?? 0)
                : '$0.00'
              }
            </p>
          </div>
          <div className="bg-amber-100 p-3 rounded-full">
            <Calculator className="text-amber-600" size={24} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Ingresos totales ÷ tickets del periodo
          </p>
        </div>
      </div>
    </div>
  );
} 