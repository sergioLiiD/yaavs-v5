import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Eliminar registros en el orden correcto
    await prisma.piezas_reparacion.deleteMany({});
    await prisma.checklist_diagnostico.deleteMany({});
    await prisma.reparacion.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.estatusReparacion.deleteMany({});
    await prisma.problemas_frecuentes.deleteMany({});
    await prisma.piezas.deleteMany({});

    console.log('Limpieza completada exitosamente');
  } catch (error) {
    console.error('Error durante la limpieza:', error);
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