'use client';

import React from 'react';
import MainLayout from '@/components/layout/MainLayout';

// Componentes
const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
      <span className={`material-symbols-outlined text-3xl ${color.replace('border-', 'text-')}`}>
        {icon}
      </span>
    </div>
  </div>
);

export default function DashboardPage() {
  // Datos de ejemplo para el dashboard
  const stats = [
    { title: 'Tickets Abiertos', value: '24', icon: 'confirmation_number', color: 'border-yellow-500' },
    { title: 'En Reparación', value: '12', icon: 'build', color: 'border-blue-500' },
    { title: 'Reparados', value: '8', icon: 'check_circle', color: 'border-green-500' },
    { title: 'Por Entregar', value: '5', icon: 'local_shipping', color: 'border-purple-500' },
  ];

  const recentTickets = [
    { id: 'TK-2024-001', cliente: 'Juan Pérez', modelo: 'iPhone 13', problema: 'Pantalla rota', estatus: 'En diagnóstico' },
    { id: 'TK-2024-002', cliente: 'María Gómez', modelo: 'Samsung S21', problema: 'No carga', estatus: 'Presupuesto enviado' },
    { id: 'TK-2024-003', cliente: 'Carlos López', modelo: 'Xiaomi Mi 11', problema: 'Batería', estatus: 'En reparación' },
    { id: 'TK-2024-004', cliente: 'Ana Martínez', modelo: 'iPhone 12', problema: 'No enciende', estatus: 'Reparado' },
  ];

  return (
    <MainLayout title="Dashboard - Sistema de Reparación">
      <div className="py-6">
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          {/* Tarjetas de estadísticas */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Gráfico o información adicional */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets por Estatus</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
              <p className="text-gray-500">Aquí irá un gráfico de tickets por estatus</p>
            </div>
          </div>

          {/* Tickets recientes */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets Recientes</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problema
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.modelo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.problema}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {ticket.estatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 