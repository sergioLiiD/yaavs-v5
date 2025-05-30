import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const password = 'whoS5un0%';
    const nombre = 'Sergio';
    const apellidoPaterno = 'Velazco';
    const apellidoMaterno = 'Bernal';
    const nivel = 'ADMINISTRADOR';

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.log('El usuario ya existe');
      return;
    }

    // Crear el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario administrador
    const usuario = await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        nivel,
        activo: true
      }
    });

    console.log('Usuario administrador creado exitosamente:', {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      nivel: usuario.nivel
    });
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 