const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'sergio@hoom.mx' }
    });

    console.log('Usuario encontrado:', usuario);
  } catch (error) {
    console.error('Error:', error);
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