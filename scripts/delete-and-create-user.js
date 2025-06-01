const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Primero eliminar el usuario si existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: 'sergio@hoom.mx' }
    });

    if (existingUser) {
      console.log('Eliminando usuario existente...');
      await prisma.usuario.delete({
        where: { email: 'sergio@hoom.mx' }
      });
      console.log('Usuario eliminado');
    }

    // Crear el nuevo usuario
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

    console.log('Nuevo usuario creado:', usuario);
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