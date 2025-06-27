import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const nombre = 'Sergio';
    const apellidoPaterno = 'Velazco';
    const apellidoMaterno = 'Bernal';
    const password = 'whoS5un0%';
    const nivel = 'ADMINISTRADOR';

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      console.log('El usuario ya existe');
      return;
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario
    const usuario = await prisma.usuario.create({
      data: {
        email,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        passwordHash,
        nivel,
        activo: true
      }
    });

    console.log('Usuario creado exitosamente:', {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      nivel: usuario.nivel
    });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 