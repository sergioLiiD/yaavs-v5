import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function RepairPointPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Obtener el punto de reparación del usuario
  const user = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    include: {
      puntoRecoleccion: true
    }
  });

  if (!user?.puntoRecoleccion) {
    redirect('/auth/login');
  }

  // Obtener estadísticas básicas
  const [totalTickets, ticketsPendientes, ticketsEnProceso] = await Promise.all([
    prisma.ticket.count({
      where: { puntoRecoleccionId: user.puntoRecoleccion.id }
    }),
    prisma.ticket.count({
      where: { 
        puntoRecoleccionId: user.puntoRecoleccion.id,
        estado: 'PENDIENTE'
      }
    }),
    prisma.ticket.count({
      where: { 
        puntoRecoleccionId: user.puntoRecoleccion.id,
        estado: 'EN_PROCESO'
      }
    })
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Punto de Reparación: {user.puntoRecoleccion.nombre}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total de Tickets</h3>
          <p className="text-3xl font-bold">{totalTickets}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tickets Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">{ticketsPendientes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tickets en Proceso</h3>
          <p className="text-3xl font-bold text-blue-600">{ticketsEnProceso}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información del Punto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Dirección</p>
            <p className="font-medium">{user.puntoRecoleccion.location.address}</p>
          </div>
          <div>
            <p className="text-gray-600">Horario</p>
            <p className="font-medium">{user.puntoRecoleccion.schedule}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 