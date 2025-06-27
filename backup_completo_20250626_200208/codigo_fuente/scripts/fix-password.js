const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const password = 'whoS5uno%';

    // Primero obtener el usuario actual
    const currentUser = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!currentUser) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Usuario actual:', {
      id: currentUser.id,
      email: currentUser.email,
      roles: currentUser.roles.map(ur => ur.rol.nombre),
      hashActual: currentUser.passwordHash
    });

    // Generar nuevo hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash generado:', newHash);

    // Actualizar el usuario con el nuevo hash
    const updatedUser = await prisma.usuario.update({
      where: { email },
      data: {
        passwordHash: newHash,
        updatedAt: new Date()
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    console.log('Usuario actualizado:', {
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles.map(ur => ur.rol.nombre),
      nuevoHash: updatedUser.passwordHash
    });

    // Verificar que la contraseña funciona
    const isValid = await bcrypt.compare(password, updatedUser.passwordHash);
    console.log('Verificación final:', isValid ? '✅ Contraseña válida' : '❌ Contraseña inválida');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 