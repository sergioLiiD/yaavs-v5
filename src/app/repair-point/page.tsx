import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function formatTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

function formatHorario(horario: any) {
  const dias = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  const ordenDias = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return ordenDias.map(dia => {
    const info = horario[dia];
    return {
      dia: dias[dia as keyof typeof dias],
      abierto: info.open,
      horario: info.open ? `${formatTime(info.start)} - ${formatTime(info.end)}` : 'Cerrado'
    };
  });
}

export default async function RepairPointPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/repair-point');
  }

  try {
    // Obtener el punto de reparación del usuario
    const user = await prisma.usuario.findUnique({
      where: { id: session.user.id },
      include: {
        puntosRecoleccion: {
          include: {
            puntoRecoleccion: true
          }
        }
      }
    });

    if (!user?.puntosRecoleccion?.[0]?.puntoRecoleccion) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No tienes un punto de reparación asignado
            </h2>
            <p className="text-gray-600">
              Por favor, contacta al administrador para que te asigne un punto de reparación.
            </p>
          </div>
        </div>
      );
    }

    const puntoRecoleccion = user.puntosRecoleccion[0].puntoRecoleccion;

    // Obtener estadísticas básicas
    const [totalTickets, ticketsPendientes, ticketsEnProceso] = await Promise.all([
      prisma.ticket.count({
        where: { puntoRecoleccionId: puntoRecoleccion.id }
      }),
      prisma.ticket.count({
        where: { 
          puntoRecoleccionId: puntoRecoleccion.id,
          estatusReparacionId: 1 // PENDIENTE
        }
      }),
      prisma.ticket.count({
        where: { 
          puntoRecoleccionId: puntoRecoleccion.id,
          estatusReparacionId: 2 // EN_PROCESO
        }
      })
    ]);

    const horario = puntoRecoleccion.horario && typeof puntoRecoleccion.horario === 'object'
      ? formatHorario(puntoRecoleccion.horario)
      : [];

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Punto de Reparación: {puntoRecoleccion.nombre}
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
              <p className="font-medium">
                {puntoRecoleccion.ubicacion && typeof puntoRecoleccion.ubicacion === 'object' 
                  ? (puntoRecoleccion.ubicacion as any).address || 'No disponible'
                  : 'No disponible'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Horario</p>
              <div className="space-y-1">
                {horario.map(({ dia, abierto, horario }) => (
                  <div key={dia} className={`flex justify-between ${!abierto ? 'text-gray-400' : ''}`}>
                    <span className="font-medium">{dia}</span>
                    <span>{horario}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error al cargar la página:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error al cargar la página
          </h2>
          <p className="text-gray-600">
            Ha ocurrido un error al cargar la información. Por favor, intenta nuevamente.
          </p>
        </div>
      </div>
    );
  }
} 