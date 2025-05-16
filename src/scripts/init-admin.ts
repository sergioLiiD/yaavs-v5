import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NivelUsuario } from '@/types/usuario';

async function createAdminUser() {
  try {
    const email = 'admin@yaavs.com';
    const password = 'Admin123!';
    const nombre = 'Administrador';
    const apellidoPaterno = 'Sistema';
    const nivel = 'ADMINISTRADOR';

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.log('El usuario administrador ya existe');
      return;
    }

    // Crear el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario administrador
    await prisma.usuario.create({
      data: {
        email,
        passwordHash,
        nombre,
        apellidoPaterno,
        nivel,
        activo: true
      }
    });

    console.log('Usuario administrador creado exitosamente');
    console.log('Email:', email);
    console.log('Contraseña:', password);
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 