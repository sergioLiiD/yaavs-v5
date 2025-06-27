import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Verificando usuarios en la base de datos...\n');

    const users = await prisma.usuario.findMany({
      where: {
        activo: true
      },
      include: {
        usuarioRoles: {
          include: {
            rol: true
          }
        },
        puntosRecoleccion: {
          include: {
            puntoRecoleccion: true
          }
        }
      }
    });

    console.log(`Total de usuarios activos: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`Usuario ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nombre: ${user.nombre}`);
      console.log(`  Activo: ${user.activo}`);
      console.log(`  Roles: ${user.usuarioRoles.map(ur => ur.rol.nombre).join(', ')}`);
      console.log(`  Puntos de recolección: ${user.puntosRecoleccion.map(up => up.puntoRecoleccion.nombre).join(', ')}`);
      console.log(`  Password hash: ${user.passwordHash ? 'Sí' : 'No'}`);
      console.log('');
    });

    // Probar algunas contraseñas comunes
    const testPasswords = ['admin123', 'password', '123456', 'admin'];
    const testUser = users[0];

    if (testUser) {
      console.log(`Probando contraseñas para el usuario: ${testUser.email}`);
      
      for (const password of testPasswords) {
        try {
          const isValid = await compare(password, testUser.passwordHash);
          console.log(`  "${password}": ${isValid ? 'VÁLIDA' : 'inválida'}`);
        } catch (error) {
          console.log(`  "${password}": Error al verificar`);
        }
      }
    }

  } catch (error) {
    console.error('Error al verificar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 