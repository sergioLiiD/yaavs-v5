const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const password = 'whoS5uno%';

    // Generar nuevo hash
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash generado:', passwordHash);

    // Actualizar el usuario
    const updatedUser = await prisma.usuario.update({
      where: { email },
      data: {
        passwordHash,
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

    console.log('Usuario actualizado exitosamente:', {
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles.map(ur => ur.rol.nombre)
    });

    // Verificar que el hash coincide
    const isValid = await bcrypt.compare(password, updatedUser.passwordHash);
    console.log('Verificación del hash:', isValid ? '✅ Hash válido' : '❌ Hash inválido');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 