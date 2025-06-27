import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const estados = [
    {
      nombre: 'Recibido',
      descripcion: 'El dispositivo ha sido recibido y está pendiente de diagnóstico',
      orden: 1,
      color: '#FFA500',
      activo: true
    },
    {
      nombre: 'En Diagnóstico',
      descripcion: 'El dispositivo está siendo diagnosticado',
      orden: 2,
      color: '#FFD700',
      activo: true
    },
    {
      nombre: 'Diagnóstico Completado',
      descripcion: 'El diagnóstico ha sido completado y se ha generado el presupuesto',
      orden: 3,
      color: '#87CEEB',
      activo: true
    },
    {
      nombre: 'Presupuesto Aprobado',
      descripcion: 'El cliente ha aprobado el presupuesto',
      orden: 4,
      color: '#90EE90',
      activo: true
    },
    {
      nombre: 'En Reparación',
      descripcion: 'El dispositivo está siendo reparado',
      orden: 5,
      color: '#FF69B4',
      activo: true
    },
    {
      nombre: 'Reparado',
      descripcion: 'La reparación ha sido completada',
      orden: 6,
      color: '#00FF00',
      activo: true
    },
    {
      nombre: 'Listo para Entrega',
      descripcion: 'El dispositivo está listo para ser entregado al cliente',
      orden: 7,
      color: '#008000',
      activo: true
    },
    {
      nombre: 'Entregado',
      descripcion: 'El dispositivo ha sido entregado al cliente',
      orden: 8,
      color: '#006400',
      activo: true
    },
    {
      nombre: 'Cancelado',
      descripcion: 'El ticket ha sido cancelado',
      orden: 9,
      color: '#FF0000',
      activo: true
    }
  ];

  // Primero eliminamos todos los estados existentes
  await prisma.estatusReparacion.deleteMany({});

  // Luego creamos los nuevos estados
  for (const estado of estados) {
    await prisma.estatusReparacion.create({
      data: estado
    });
  }

  console.log('Estados de reparación actualizados correctamente');
}

main()
  .catch((e) => {
    console.error('Error al actualizar estados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 