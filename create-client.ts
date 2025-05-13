import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cliente = await prisma.cliente.create({
    data: {
      nombre: 'Cliente',
      apellidoPaterno: 'Ejemplo',
      apellidoMaterno: 'Test',
      telefonoCelular: '1234567890',
      email: 'cliente@ejemplo.com',
    },
  });

  console.log('Cliente creado:', cliente);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 