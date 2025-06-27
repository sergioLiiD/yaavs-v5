import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

function formatTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
}

function formatHorario(horario: any) {
  if (!horario) return [];

  const diasMap = {
    'monday': 'Lunes',
    'tuesday': 'Martes', 
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };

  const horarioFormateado = [];

  for (const [diaEn, diaEs] of Object.entries(diasMap)) {
    if (horario[diaEn] && horario[diaEn].open) {
      const { start, end } = horario[diaEn];
      horarioFormateado.push({
        dia: diaEs,
        horario: `${formatTime(start)} - ${formatTime(end)}`
      });
    }
  }

  return horarioFormateado;
}

export default async function RepairPointPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/repair-point');
  }

  try {
    // Obtener el punto de reparación del usuario
    const user = await prisma.usuarios.findUnique({
      where: { id: session.user.id },
      include: {
        usuarios_puntos_recoleccion: {
          include: {
            puntos_recoleccion: true
          }
        }
      }
    });

    if (!user?.usuarios_puntos_recoleccion?.[0]?.puntos_recoleccion) {
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

    const puntoRecoleccion = user.usuarios_puntos_recoleccion[0].puntos_recoleccion;

    // Obtener estadísticas básicas
    const [totalTickets, ticketsPendientes, ticketsEnProceso] = await Promise.all([
      prisma.tickets.count({
        where: { punto_recoleccion_id: puntoRecoleccion.id }
      }),
      prisma.tickets.count({
        where: { 
          punto_recoleccion_id: puntoRecoleccion.id,
          estatus_reparacion_id: 1 // PENDIENTE
        }
      }),
      prisma.tickets.count({
        where: { 
          punto_recoleccion_id: puntoRecoleccion.id,
          estatus_reparacion_id: 2 // EN_PROCESO
        }
      })
    ]);

    const horario = puntoRecoleccion.schedule && typeof puntoRecoleccion.schedule === 'object'
      ? formatHorario(puntoRecoleccion.schedule)
      : [];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estadísticas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total de tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tickets pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{ticketsPendientes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tickets en proceso</p>
                <p className="text-2xl font-bold text-blue-600">{ticketsEnProceso}</p>
              </div>
            </div>
          </div>

          {/* Información del punto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Punto</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Nombre:</span> {puntoRecoleccion.nombre}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Dirección:</span> {puntoRecoleccion.location && typeof puntoRecoleccion.location === 'object' ? (puntoRecoleccion.location as any).address : 'No disponible'}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">Teléfono:</span> {puntoRecoleccion.phone}
              </p>
            </div>
          </div>

          {/* Horario */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Horario</h3>
            <div className="space-y-2">
              {horario.map(({ dia, horario }) => (
                <div key={dia} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">{dia}</span>
                  <span className="text-sm text-gray-900">{horario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error al cargar la información
          </h2>
          <p className="text-gray-600">
            Por favor, intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }
} 