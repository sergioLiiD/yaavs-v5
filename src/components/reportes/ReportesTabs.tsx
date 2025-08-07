'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

const tabs = [
  {
    id: 'financiero',
    name: 'Reporte Financiero',
    icon: BarChart3,
    href: '/dashboard/reportes/financiero',
    description: 'Análisis de ingresos, egresos y balance'
  },
  // Futuros reportes
  // {
  //   id: 'ventas',
  //   name: 'Reporte de Ventas',
  //   icon: TrendingUp,
  //   href: '/dashboard/reportes/ventas',
  //   description: 'Análisis detallado de ventas'
  // },
  // {
  //   id: 'clientes',
  //   name: 'Reporte de Clientes',
  //   icon: Users,
  //   href: '/dashboard/reportes/clientes',
  //   description: 'Análisis de comportamiento de clientes'
  // },
  // {
  //   id: 'inventario',
  //   name: 'Reporte de Inventario',
  //   icon: Package,
  //   href: '/dashboard/reportes/inventario',
  //   description: 'Análisis de stock y movimientos'
  // }
];

export default function ReportesTabs() {
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = tabs.find(tab => pathname === tab.href) || tabs[0];

  return (
    <div className="space-y-6">
      {/* Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.href)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-[#FEBF19] text-[#FEBF19]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={20} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          {(() => {
            const Icon = activeTab.icon;
            return <Icon size={24} className="text-[#FEBF19]" />;
          })()}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{activeTab.name}</h2>
            <p className="text-gray-600">{activeTab.description}</p>
          </div>
        </div>

        {/* Renderizar el contenido específico de cada pestaña */}
        {activeTab.id === 'financiero' && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Selecciona "Reporte Financiero" para ver el análisis completo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 