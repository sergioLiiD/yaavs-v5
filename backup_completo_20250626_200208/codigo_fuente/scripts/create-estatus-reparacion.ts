import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const estatus = [
  { nombre: 'RECIBIDO', descripcion: 'Equipo recibido en tienda', orden: 1, color: '#2563eb' },
  { nombre: 'DIAGNOSTICO', descripcion: 'En diagnóstico', orden: 2, color: '#f59e42' },
  { nombre: 'EN_PROCESO', descripcion: 'En proceso de reparación', orden: 3, color: '#fbbf24' },
  { nombre: 'EN_ESPERA', descripcion: 'En espera de refacciones o autorización', orden: 4, color: '#a3a3a3' },
  { nombre: 'FINALIZADO', descripcion: 'Reparación finalizada', orden: 5, color: '#22c55e' },
  { nombre: 'ENTREGADO', descripcion: 'Equipo entregado al cliente', orden: 6, color: '#0ea5e9' },
  { nombre: 'CANCELADO', descripcion: 'Reparación cancelada', orden: 7, color: '#ef4444' },
];

async function main() {
  for (const estado of estatus) {
    const existe = await prisma.estatusReparacion.findUnique({
      where: { nombre: estado.nombre }
    });
    if (!existe) {
      await prisma.estatusReparacion.create({
        data: estado
      });
      console.log(`Estado creado: ${estado.nombre}`);
    } else {
      console.log(`Estado ya existe: ${estado.nombre}`);
    }
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