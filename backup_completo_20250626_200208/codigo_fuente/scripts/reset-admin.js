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

    // Crear el hash de la contraseña
    const password = 'whoS5uno%';
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Hash de la contraseña generado:', passwordHash);

    // Crear el nuevo usuario
    const usuario = await prisma.usuario.create({
      data: {
        email: 'sergio@hoom.mx',
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        passwordHash,
        activo: true,
        roles: {
          create: {
            rol: {
              connect: {
                nombre: 'ADMINISTRADOR'
              }
            }
          }
        }
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    console.log('Usuario administrador creado exitosamente:', {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      roles: usuario.roles.map(ur => ur.rol.nombre)
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 