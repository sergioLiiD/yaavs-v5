import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Crear los estados de reparación
    const estados = [
      {
        nombre: 'Recibido',
        descripcion: 'El dispositivo ha sido recibido y está pendiente de diagnóstico',
        orden: 1,
        color: '#FFA500', // Naranja
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'En Diagnóstico',
        descripcion: 'El dispositivo está siendo diagnosticado',
        orden: 2,
        color: '#FFD700', // Amarillo
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Completado',
        descripcion: 'El diagnóstico ha sido completado y se ha generado el presupuesto',
        orden: 3,
        color: '#87CEEB', // Azul cielo
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Pendiente',
        descripcion: 'El diagnóstico está pendiente de aprobación del cliente',
        orden: 4,
        color: '#FFB6C1', // Rosa claro
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Aprobado',
        descripcion: 'El cliente ha aprobado el diagnóstico',
        orden: 5,
        color: '#98FB98', // Verde claro
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Presupuesto Aprobado',
        descripcion: 'El cliente ha aprobado el presupuesto',
        orden: 6,
        color: '#90EE90', // Verde
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'En Reparación',
        descripcion: 'El dispositivo está siendo reparado',
        orden: 7,
        color: '#FF69B4', // Rosa
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Reparación Completada',
        descripcion: 'La reparación ha sido completada',
        orden: 8,
        color: '#00FF00', // Verde brillante
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Listo para Entrega',
        descripcion: 'El dispositivo está listo para ser entregado al cliente',
        orden: 9,
        color: '#008000', // Verde oscuro
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Entregado',
        descripcion: 'El dispositivo ha sido entregado al cliente',
        orden: 10,
        color: '#006400', // Verde muy oscuro
        activo: true,
        updatedAt: new Date()
      },
      {
        nombre: 'Cancelado',
        descripcion: 'El ticket ha sido cancelado',
        orden: 11,
        color: '#FF0000', // Rojo
        activo: true,
        updatedAt: new Date()
      }
    ];

    // Eliminar registros en el orden correcto
    await prisma.piezas_reparacion.deleteMany({});
    await prisma.checklist_diagnostico.deleteMany({});
    await prisma.reparacion.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.estatusReparacion.deleteMany({});

    // Crear los nuevos estados
    const estadosCreados = await prisma.estatusReparacion.createMany({
      data: estados
    });

    console.log('Estados de reparación creados:', estadosCreados.count);
  } catch (error) {
    console.error('Error al crear estados de reparación:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 