import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const estadosReparacion = [
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
      nombre: 'Diagnóstico Pendiente',
      descripcion: 'El diagnóstico está pendiente de aprobación del cliente',
      orden: 4,
      color: '#FFB6C1',
      activo: true
    },
    {
      nombre: 'Diagnóstico Aprobado',
      descripcion: 'El cliente ha aprobado el diagnóstico',
      orden: 5,
      color: '#98FB98',
      activo: true
    },
    {
      nombre: 'Presupuesto Aprobado',
      descripcion: 'El cliente ha aprobado el presupuesto',
      orden: 6,
      color: '#90EE90',
      activo: true
    },
    {
      nombre: 'En Reparación',
      descripcion: 'El dispositivo está siendo reparado',
      orden: 7,
      color: '#FF69B4',
      activo: true
    },
    {
      nombre: 'Reparación Completada',
      descripcion: 'La reparación ha sido completada',
      orden: 8,
      color: '#00FF00',
      activo: true
    },
    {
      nombre: 'Listo para Entrega',
      descripcion: 'El dispositivo está listo para ser entregado al cliente',
      orden: 9,
      color: '#008000',
      activo: true
    },
    {
      nombre: 'Entregado',
      descripcion: 'El dispositivo ha sido entregado al cliente',
      orden: 10,
      color: '#006400',
      activo: true
    },
    {
      nombre: 'Cancelado',
      descripcion: 'El ticket ha sido cancelado',
      orden: 11,
      color: '#FF0000',
      activo: true
    }
  ];

  for (const estado of estadosReparacion) {
    await prisma.estatusReparacion.upsert({
      where: { nombre: estado.nombre },
      update: estado,
      create: estado
    });
  }

  console.log('Estados de reparación insertados/actualizados correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 