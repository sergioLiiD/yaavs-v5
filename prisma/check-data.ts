import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const cliente = await prisma.cliente.findFirst();
    const modelo = await prisma.modelo.findFirst();
    const tipoServicio = await prisma.tipoServicio.findFirst();
    const usuario = await prisma.usuario.findFirst();
    const estatus = await prisma.estatusReparacion.findFirst();

    console.log('Cliente:', cliente);
    console.log('Modelo:', modelo);
    console.log('Tipo Servicio:', tipoServicio);
    console.log('Usuario:', usuario);
    console.log('Estatus:', estatus);
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 