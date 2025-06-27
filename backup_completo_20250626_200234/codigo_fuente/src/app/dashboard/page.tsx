'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import RouteGuard from '@/components/route-guard';
import { HiArrowUp, HiArrowDown, HiOutlineInformationCircle } from 'react-icons/hi';

interface Stat {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  description: string;
}

interface RecentTicket {
  id: number;
  numeroTicket: string;
  cliente: string;
  modelo: string;
  problema: string;
  estado: string;
}

interface DashboardData {
  stats: Stat[];
  recentTickets: RecentTicket[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Error al cargar los datos del dashboard');
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <RouteGuard requiredPermissions={['DASHBOARD_VIEW']} section="Dashboard">
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data?.stats.map((stat, index) => (
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
              <button 
                onClick={() => router.push('/dashboard/tickets')}
                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Ver todos
              </button>
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
                  {data?.recentTickets.map((ticket) => (
                    <tr key={ticket.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {ticket.numeroTicket}
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
                        <button 
                          onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Recibido':
      return 'bg-orange-100 text-orange-800';
    case 'En Diagnóstico':
      return 'bg-yellow-100 text-yellow-800';
    case 'Diagnóstico Completado':
      return 'bg-blue-100 text-blue-800';
    case 'Presupuesto Aprobado':
      return 'bg-green-100 text-green-800';
    case 'En Reparación':
      return 'bg-purple-100 text-purple-800';
    case 'Reparado':
      return 'bg-green-100 text-green-800';
    case 'Listo para Entrega':
      return 'bg-orange-100 text-orange-800';
    case 'Entregado':
      return 'bg-blue-100 text-blue-800';
    case 'Cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 