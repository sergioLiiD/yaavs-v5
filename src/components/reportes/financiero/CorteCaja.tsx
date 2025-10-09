'use client';

import React, { useState, useEffect } from 'react';
import { ReporteService, FiltrosReporte, CorteCaja as ICorteCaja, TransaccionCorteCaja } from '@/services/reporteService';
import { Wallet, CreditCard, Building2, ChevronDown, ChevronUp } from 'lucide-react';

interface CorteCajaProps {
  filtros: FiltrosReporte;
}

export default function CorteCaja({ filtros }: CorteCajaProps) {
  const [corteCaja, setCorteCaja] = useState<ICorteCaja | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandido, setExpandido] = useState({
    EFECTIVO: true,
    TRANSFERENCIA: true,
    TARJETA: true
  });

  useEffect(() => {
    cargarCorteCaja();
  }, [filtros]);

  const cargarCorteCaja = async () => {
    try {
      setLoading(true);
      const data = await ReporteService.obtenerCorteCaja(filtros);
      setCorteCaja(data);
    } catch (error) {
      console.error('Error al cargar corte de caja:', error);
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
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleSeccion = (metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA') => {
    setExpandido(prev => ({
      ...prev,
      [metodo]: !prev[metodo]
    }));
  };

  const getMetodoConfig = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return {
          icon: Wallet,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Efectivo'
        };
      case 'TRANSFERENCIA':
        return {
          icon: Building2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Transferencia/Depósito'
        };
      case 'TARJETA':
        return {
          icon: CreditCard,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Tarjeta'
        };
      default:
        return {
          icon: Wallet,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: metodo
        };
    }
  };

  const renderTransaccionRow = (transaccion: TransaccionCorteCaja) => {
    const config = getMetodoConfig(transaccion.metodo);
    
    return (
      <tr key={transaccion.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-900">
          {formatDate(transaccion.fecha)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {formatTime(transaccion.fecha)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {transaccion.cliente}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
          {formatCurrency(transaccion.monto)}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
            <config.icon size={12} className="mr-1" />
            {config.label}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          {transaccion.numeroTicket}
        </td>
      </tr>
    );
  };

  const renderSeccionMetodo = (metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA') => {
    if (!corteCaja) return null;

    const transacciones = corteCaja.transaccionesAgrupadas[metodo];
    if (transacciones.length === 0) return null;

    const config = getMetodoConfig(metodo);
    const IconComponent = config.icon;
    const total = corteCaja.totales[metodo.toLowerCase() as 'efectivo' | 'transferencia' | 'tarjeta'];
    const cantidad = transacciones.length;
    const isExpandido = expandido[metodo];

    return (
      <div key={metodo} className={`border-2 ${config.borderColor} rounded-lg overflow-hidden mb-4`}>
        <button
          onClick={() => toggleSeccion(metodo)}
          className={`w-full ${config.bgColor} px-6 py-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-white ${config.color}`}>
              <IconComponent size={20} />
            </div>
            <div className="text-left">
              <h4 className={`font-semibold ${config.color} text-lg`}>
                {config.label}
              </h4>
              <p className="text-sm text-gray-600">
                {cantidad} {cantidad === 1 ? 'pago' : 'pagos'} • {formatCurrency(total)}
              </p>
            </div>
          </div>
          <div className={config.color}>
            {isExpandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>

        {isExpandido && (
          <div className="bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transacciones.map(transaccion => renderTransaccionRow(transaccion))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEBF19]"></div>
          <span className="ml-3 text-gray-600">Cargando corte de caja...</span>
        </div>
      </div>
    );
  }

  if (!corteCaja) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#FEBF19] p-3 rounded-full">
              <Wallet className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Corte de Caja</h3>
              <p className="text-sm text-gray-600">
                {corteCaja.resumen.totalTransacciones} {corteCaja.resumen.totalTransacciones === 1 ? 'transacción' : 'transacciones'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Cobrado</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(corteCaja.totales.total)}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Efectivo */}
          <div className="bg-white rounded-lg border-2 border-green-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Wallet className="text-green-600" size={20} />
              </div>
              <h4 className="font-semibold text-green-700">Efectivo</h4>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(corteCaja.totales.efectivo)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {corteCaja.resumen.cantidadEfectivo} {corteCaja.resumen.cantidadEfectivo === 1 ? 'pago' : 'pagos'}
            </p>
          </div>

          {/* Transferencia */}
          <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Building2 className="text-blue-600" size={20} />
              </div>
              <h4 className="font-semibold text-blue-700">Transferencia</h4>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(corteCaja.totales.transferencia)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {corteCaja.resumen.cantidadTransferencia} {corteCaja.resumen.cantidadTransferencia === 1 ? 'pago' : 'pagos'}
            </p>
          </div>

          {/* Tarjeta */}
          <div className="bg-white rounded-lg border-2 border-purple-200 p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <CreditCard className="text-purple-600" size={20} />
              </div>
              <h4 className="font-semibold text-purple-700">Tarjeta</h4>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(corteCaja.totales.tarjeta)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {corteCaja.resumen.cantidadTarjeta} {corteCaja.resumen.cantidadTarjeta === 1 ? 'pago' : 'pagos'}
            </p>
          </div>
        </div>
      </div>

      {/* Detalle por Método de Pago */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalle por Método de Pago</h4>
        
        {corteCaja.resumen.totalTransacciones === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay transacciones en el período seleccionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderSeccionMetodo('EFECTIVO')}
            {renderSeccionMetodo('TRANSFERENCIA')}
            {renderSeccionMetodo('TARJETA')}
          </div>
        )}
      </div>
    </div>
  );
}

