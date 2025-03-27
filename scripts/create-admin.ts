import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('whoS5un0%', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'sergio@hoom.mx' },
    update: {},
    create: {
      email: 'sergio@hoom.mx',
      nombre: 'Sergio',
      apellidoPaterno: 'Administrador',
      passwordHash,
      nivel: 'ADMINISTRADOR',
      activo: true,
    },
  });

  console.log('Usuario administrador creado:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 