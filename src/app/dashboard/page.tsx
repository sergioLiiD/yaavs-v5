'use client';

import { useSession } from 'next-auth/react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HiArrowUp, HiArrowDown, HiOutlineInformationCircle } from 'react-icons/hi';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  // Datos de ejemplo para tickets recientes
  const recentTickets = [
    { id: 'TK-2023-001', cliente: 'Juan Pérez', modelo: 'iPhone 13', problema: 'Pantalla rota', estado: 'En diagnóstico' },
    { id: 'TK-2023-002', cliente: 'María Gómez', modelo: 'Samsung S21', problema: 'No carga', estado: 'Presupuesto enviado' },
    { id: 'TK-2023-003', cliente: 'Carlos López', modelo: 'Xiaomi Mi 11', problema: 'Batería', estado: 'En reparación' },
    { id: 'TK-2023-004', cliente: 'Ana Martínez', modelo: 'iPhone 12', problema: 'No enciende', estado: 'Reparado' },
  ];

  // Datos de ejemplo para las estadísticas
  const stats = [
    { 
      title: 'Tickets Abiertos', 
      value: '24', 
      change: '+12%', 
      isUp: true,
      description: 'Comparado con el mes anterior'
    },
    { 
      title: 'En Reparación', 
      value: '12', 
      change: '+5%', 
      isUp: true,
      description: 'Comparado con el mes anterior'
    },
    { 
      title: 'Reparados', 
      value: '18', 
      change: '-3%', 
      isUp: false,
      description: 'Comparado con el mes anterior'
    },
    { 
      title: 'Por Entregar', 
      value: '5', 
      change: '+2%', 
      isUp: true,
      description: 'Comparado con el mes anterior'
    },
  ];

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="flex flex-col">
                <div className="text-gray-500 text-sm">{stat.title}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <div className={`flex items-center text-sm ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.isUp ? (
                      <HiArrowUp className="mr-1" />
                    ) : (
                      <HiArrowDown className="mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tickets recientes */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900">
              Tickets Recientes
            </h5>
            <a href="/dashboard/tickets" className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded">
              Ver todos
            </a>
          </div>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">ID Ticket</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Modelo</th>
                  <th scope="col" className="px-6 py-3">Problema</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4">{ticket.cliente}</td>
                    <td className="px-6 py-4">{ticket.modelo}</td>
                    <td className="px-6 py-4">{ticket.problema}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.estado)}`}>
                        {ticket.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/dashboard/tickets/${ticket.id}`} className="font-medium text-blue-600 hover:underline">
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'En diagnóstico':
      return 'bg-yellow-100 text-yellow-800';
    case 'Presupuesto enviado':
      return 'bg-blue-100 text-blue-800';
    case 'En reparación':
      return 'bg-purple-100 text-purple-800';
    case 'Reparado':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 