import { PrismaClient, NivelUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('whoS5un0%', 10);
  
  const admin = await prisma.usuario.create({
    data: {
      email: 'sergio@hoom.mx',
      nombre: 'Sergio',
      apellidoPaterno: 'Velazco',
      passwordHash,
      nivel: NivelUsuario.ADMINISTRADOR,
      activo: true
    }
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