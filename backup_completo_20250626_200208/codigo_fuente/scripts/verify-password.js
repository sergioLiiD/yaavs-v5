const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'sergio@hoom.mx';
    const password = 'whoS5uno%';

    // Obtener el usuario
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Usuario encontrado:', {
      id: user.id,
      email: user.email,
      roles: user.roles.map(ur => ur.rol.nombre)
    });

    console.log('Hash actual en la base de datos:', user.passwordHash);

    // Verificar la contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('¿La contraseña coincide?', isValid ? '✅ Sí' : '❌ No');

    // Generar un nuevo hash para comparar
    const newHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash generado:', newHash);

    // Verificar el nuevo hash
    const isValidNewHash = await bcrypt.compare(password, newHash);
    console.log('¿El nuevo hash coincide?', isValidNewHash ? '✅ Sí' : '❌ No');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 