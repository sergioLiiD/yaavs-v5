import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('whoSuno%', 10);

  const usuario = await prisma.usuario.create({
    data: {
      email: 'sergio@hoom.mx',
      nombre: 'Sergio',
      apellidoPaterno: 'Velazco',
      passwordHash,
      nivel: 'ADMINISTRADOR',
      activo: true,
      updatedAt: new Date()
    }
  });

  console.log('Usuario creado:', usuario);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 